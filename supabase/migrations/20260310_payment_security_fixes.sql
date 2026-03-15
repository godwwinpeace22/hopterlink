-- ============================================================================
-- PAYMENT & SECURITY FIXES — v2
-- Addresses all 22 audit findings for the booking/escrow/payment flow.
-- Run via: supabase db push or execute in SQL Editor.
-- ============================================================================

-- ============================================================================
-- HELPER: compute_wallet_balance(user_id)
-- Returns a user's spendable wallet balance (topups − held/released escrow).
-- ============================================================================
CREATE OR REPLACE FUNCTION compute_wallet_balance(p_user_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_total_in DECIMAL(10,2);
  v_total_out DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(amount_cents / 100.0), 0)
  INTO v_total_in
  FROM wallet_topups
  WHERE user_id = p_user_id AND status = 'succeeded';

  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_out
  FROM escrow_payments
  WHERE client_id = p_user_id AND status IN ('pending', 'held', 'released');

  RETURN GREATEST(0, v_total_in - v_total_out);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 1. CREATE DIRECT BOOKING (Fixed-price model)
-- Called by client when booking a provider directly (not via job/quote).
-- Validates wallet balance, creates booking + escrow atomically.
-- Booking starts in 'pending' — provider must confirm before work begins.
-- ============================================================================
CREATE OR REPLACE FUNCTION create_direct_booking(
  p_provider_id UUID,
  p_service_type TEXT,
  p_description TEXT,
  p_scheduled_date TEXT,       -- ISO date string
  p_scheduled_time TEXT DEFAULT NULL,
  p_duration_hours DECIMAL DEFAULT NULL,
  p_location JSONB DEFAULT '{}'::jsonb,
  p_amount DECIMAL DEFAULT 0,
  p_special_instructions TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance DECIMAL(10,2);
  v_platform_fee DECIMAL(10,2);
  v_provider_amount DECIMAL(10,2);
  v_booking_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_user_id = p_provider_id THEN
    RAISE EXCEPTION 'Cannot book yourself';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  IF p_service_type IS NULL OR LENGTH(TRIM(p_service_type)) = 0 THEN
    RAISE EXCEPTION 'Service type is required';
  END IF;

  -- Verify wallet balance
  v_balance := compute_wallet_balance(v_user_id);
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: $%, Required: $%', v_balance, p_amount;
  END IF;

  -- Compute fees
  v_platform_fee := ROUND(p_amount * 0.10, 2);
  v_provider_amount := p_amount - v_platform_fee;

  -- Create booking (pending — awaits provider confirmation)
  INSERT INTO bookings (
    client_id, provider_id,
    service_type, description,
    scheduled_date, scheduled_time, duration_hours,
    location, amount,
    payment_method, payment_status,
    special_instructions, status
  )
  VALUES (
    v_user_id, p_provider_id,
    TRIM(p_service_type), NULLIF(TRIM(COALESCE(p_description, '')), ''),
    p_scheduled_date::TIMESTAMPTZ, NULLIF(TRIM(COALESCE(p_scheduled_time, '')), ''),
    p_duration_hours,
    p_location, p_amount,
    'wallet', 'pending',
    NULLIF(TRIM(COALESCE(p_special_instructions, '')), ''), 'pending'
  )
  RETURNING id INTO v_booking_id;

  -- Create escrow (pending — funds held when provider confirms)
  INSERT INTO escrow_payments (
    booking_id, client_id, provider_id,
    amount, platform_fee, provider_amount,
    status
  )
  VALUES (
    v_booking_id, v_user_id, p_provider_id,
    p_amount, v_platform_fee, v_provider_amount,
    'pending'
  );

  -- Notify provider
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    p_provider_id,
    'booking_confirmed',
    'New booking request',
    'You have a new ' || TRIM(p_service_type) || ' booking request for $' || p_amount || '. Please confirm or decline.',
    v_booking_id
  );

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 2. PROVIDER CONFIRMS BOOKING
-- Provider accepts a pending booking. Escrow is moved to 'held'.
-- Balance is re-verified at confirmation time.
-- ============================================================================
CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_balance DECIMAL(10,2);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.status, b.amount, b.service_type
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.provider_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the assigned provider can confirm this booking';
  END IF;

  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending bookings can be confirmed (status: %)', v_booking.status;
  END IF;

  -- Re-verify client wallet balance at confirmation time
  v_balance := compute_wallet_balance(v_booking.client_id);
  IF v_balance < v_booking.amount THEN
    RAISE EXCEPTION 'Client has insufficient wallet balance to cover this booking';
  END IF;

  -- Hold escrow
  UPDATE escrow_payments
  SET status = 'held', held_at = NOW()
  WHERE booking_id = p_booking_id;

  -- Confirm booking
  UPDATE bookings
  SET status = 'confirmed', confirmed_at = NOW(), payment_status = 'held'
  WHERE id = p_booking_id;

  -- Notify client
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    'Booking confirmed',
    'Your ' || v_booking.service_type || ' booking has been confirmed by the provider. Funds are held in escrow.',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 3. PROVIDER DECLINES BOOKING
-- Provider rejects a pending booking. Escrow is removed.
-- ============================================================================
CREATE OR REPLACE FUNCTION decline_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.status, b.service_type
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.provider_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the assigned provider can decline this booking';
  END IF;

  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending bookings can be declined (status: %)', v_booking.status;
  END IF;

  -- Cancel booking
  UPDATE bookings
  SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = 'Declined by provider'
  WHERE id = p_booking_id;

  -- Refund escrow (was pending, not held yet)
  UPDATE escrow_payments
  SET status = 'refunded', refunded_at = NOW()
  WHERE booking_id = p_booking_id;

  -- Notify client
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    'Booking declined',
    'The provider has declined your ' || v_booking.service_type || ' booking request.',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 4. CANCEL BOOKING (with escrow refund)
-- Called by client. Refunds escrow if held/pending.
-- Only works for pending or confirmed bookings.
-- ============================================================================
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_reason TEXT DEFAULT 'Cancelled by client'
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.status, b.service_type
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.client_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the client can cancel this booking';
  END IF;

  IF v_booking.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Booking cannot be cancelled (status: %)', v_booking.status;
  END IF;

  -- Cancel booking
  UPDATE bookings
  SET status = 'cancelled',
      cancelled_at = NOW(),
      cancellation_reason = COALESCE(NULLIF(TRIM(p_reason), ''), 'Cancelled by client')
  WHERE id = p_booking_id;

  -- Refund escrow
  UPDATE escrow_payments
  SET status = 'refunded', refunded_at = NOW()
  WHERE booking_id = p_booking_id
    AND status IN ('pending', 'held');

  -- Update booking payment status
  UPDATE bookings
  SET payment_status = 'refunded'
  WHERE id = p_booking_id;

  -- Notify provider
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.provider_id,
    'booking_confirmed',
    'Booking cancelled',
    'The client has cancelled the ' || v_booking.service_type || ' booking.',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 5. UPDATED accept_quote — now verifies wallet balance
-- ============================================================================
CREATE OR REPLACE FUNCTION accept_quote(
  p_quote_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_quote RECORD;
  v_job RECORD;
  v_booking_id UUID;
  v_balance DECIMAL(10,2);
  v_escrow_amount DECIMAL(10,2);
  v_platform_fee DECIMAL(10,2);
  v_provider_amount DECIMAL(10,2);
  v_other_provider RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Fetch quote with lock
  SELECT q.id, q.job_id, q.provider_id, q.amount, q.status
  INTO v_quote
  FROM quotes q
  WHERE q.id = p_quote_id
  FOR UPDATE;

  IF v_quote IS NULL THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;

  IF v_quote.status <> 'pending' THEN
    RAISE EXCEPTION 'Quote is no longer pending (status: %)', v_quote.status;
  END IF;

  -- Fetch job with lock
  SELECT j.id, j.client_id, j.title, j.category, j.description, j.location, j.status
  INTO v_job
  FROM jobs j
  WHERE j.id = v_quote.job_id
  FOR UPDATE;

  IF v_job IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_job.client_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the job owner can accept a quote';
  END IF;

  IF v_job.status NOT IN ('open', 'quoted') THEN
    RAISE EXCEPTION 'Job is not open for quotes (status: %)', v_job.status;
  END IF;

  -- Verify wallet balance
  v_balance := compute_wallet_balance(v_user_id);
  IF v_balance < v_quote.amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: $%, Required: $%', v_balance, v_quote.amount;
  END IF;

  -- 1. Accept the quote
  UPDATE quotes
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_quote_id;

  -- 2. Reject all other pending quotes for this job
  UPDATE quotes
  SET status = 'rejected'
  WHERE job_id = v_quote.job_id
    AND id <> p_quote_id
    AND status = 'pending';

  -- 3. Update job status
  UPDATE jobs
  SET status = 'accepted'
  WHERE id = v_quote.job_id;

  -- 4. Create booking with escrow held immediately (provider already agreed via quote)
  v_escrow_amount := v_quote.amount;
  v_platform_fee := ROUND(v_escrow_amount * 0.10, 2);
  v_provider_amount := v_escrow_amount - v_platform_fee;

  INSERT INTO bookings (
    client_id, provider_id, job_id, quote_id,
    service_type, description, scheduled_date,
    amount, status, payment_status, payment_method, location
  )
  VALUES (
    v_user_id, v_quote.provider_id, v_quote.job_id, p_quote_id,
    v_job.category, v_job.description, NOW(),
    v_escrow_amount, 'confirmed', 'held', 'wallet', v_job.location
  )
  RETURNING id INTO v_booking_id;

  -- 5. Create escrow payment (held immediately — provider already agreed via quote)
  INSERT INTO escrow_payments (
    booking_id, client_id, provider_id,
    amount, platform_fee, provider_amount,
    status, held_at
  )
  VALUES (
    v_booking_id, v_user_id, v_quote.provider_id,
    v_escrow_amount, v_platform_fee, v_provider_amount,
    'held', NOW()
  );

  -- 6. Notify accepted provider
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_quote.provider_id,
    'quote_accepted',
    'Quote accepted!',
    'Your quote of $' || v_quote.amount || ' for "' || v_job.title || '" has been accepted. Funds are in escrow.',
    v_booking_id
  );

  -- 7. Notify rejected providers
  FOR v_other_provider IN
    SELECT provider_id FROM quotes
    WHERE job_id = v_quote.job_id
      AND id <> p_quote_id
      AND status = 'rejected'
  LOOP
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
      v_other_provider.provider_id,
      'quote_accepted',
      'Quote not selected',
      'Another provider was selected for "' || v_job.title || '".',
      v_quote.job_id
    );
  END LOOP;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 6. START BOOKING
-- Called by provider when work begins on a confirmed booking.
-- ============================================================================
CREATE OR REPLACE FUNCTION start_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.job_id, b.status, b.service_type
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.provider_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the assigned provider can start this booking';
  END IF;

  IF v_booking.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Only confirmed bookings can be started (status: %)', v_booking.status;
  END IF;

  UPDATE bookings
  SET status = 'in_progress', started_at = NOW()
  WHERE id = p_booking_id;

  IF v_booking.job_id IS NOT NULL THEN
    UPDATE jobs
    SET status = 'in_progress'
    WHERE id = v_booking.job_id;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    'Work started',
    'Your ' || v_booking.service_type || ' booking is now in progress.',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 7. COMPLETE BOOKING (unchanged logic but re-created for consistency)
-- Called by provider to mark work as done.
-- ============================================================================
CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.job_id, b.status, b.service_type
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.provider_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the assigned provider can complete this booking';
  END IF;

  IF v_booking.status NOT IN ('confirmed', 'in_progress') THEN
    RAISE EXCEPTION 'Booking cannot be completed (status: %)', v_booking.status;
  END IF;

  -- 1. Mark booking as completed
  UPDATE bookings
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_booking_id;

  -- 2. Update linked job if exists
  IF v_booking.job_id IS NOT NULL THEN
    UPDATE jobs
    SET status = 'completed', completed_at = NOW()
    WHERE id = v_booking.job_id;
  END IF;

  -- 3. Notify client to review and release escrow
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    'Job completed — please review',
    'Your ' || v_booking.service_type || ' booking has been marked as complete. Please review and release payment.',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 8. RELEASE ESCROW (unchanged logic but re-created for consistency)
-- Called by client after approving completed work.
-- ============================================================================
CREATE OR REPLACE FUNCTION release_escrow(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_escrow RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.status, b.amount
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.client_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the client can release escrow';
  END IF;

  IF v_booking.status <> 'completed' THEN
    RAISE EXCEPTION 'Booking must be completed before releasing escrow (status: %)', v_booking.status;
  END IF;

  -- Lock and validate escrow
  SELECT e.id, e.status, e.provider_amount
  INTO v_escrow
  FROM escrow_payments e
  WHERE e.booking_id = p_booking_id
  FOR UPDATE;

  IF v_escrow IS NULL THEN
    RAISE EXCEPTION 'Escrow payment not found for this booking';
  END IF;

  IF v_escrow.status NOT IN ('pending', 'held') THEN
    RAISE EXCEPTION 'Escrow already processed (status: %)', v_escrow.status;
  END IF;

  -- 1. Release escrow
  UPDATE escrow_payments
  SET status = 'released', released_at = NOW()
  WHERE booking_id = p_booking_id;

  -- 2. Update booking payment status
  UPDATE bookings
  SET payment_status = 'released'
  WHERE id = p_booking_id;

  -- 3. Update provider stats
  UPDATE provider_profiles
  SET
    jobs_completed = jobs_completed + 1,
    total_earned = total_earned + v_escrow.provider_amount
  WHERE user_id = v_booking.provider_id;

  -- 4. Update client stats
  UPDATE client_profiles
  SET total_spent = total_spent + v_booking.amount
  WHERE user_id = v_booking.client_id;

  -- 5. Notify provider
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.provider_id,
    'payment_released',
    'Payment released!',
    'Payment of $' || v_escrow.provider_amount || ' has been released to your earnings.',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 9. DISPUTE BOOKING (fixed notification type)
-- Called by client to dispute a completed booking.
-- ============================================================================
CREATE OR REPLACE FUNCTION dispute_booking(
  p_booking_id UUID,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_report_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 10 THEN
    RAISE EXCEPTION 'Dispute reason must be at least 10 characters';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.status
  INTO v_booking
  FROM bookings b
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.client_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the client can dispute a booking';
  END IF;

  IF v_booking.status NOT IN ('completed', 'in_progress') THEN
    RAISE EXCEPTION 'Booking cannot be disputed (status: %)', v_booking.status;
  END IF;

  -- 1. Mark booking as disputed
  UPDATE bookings
  SET status = 'disputed'
  WHERE id = p_booking_id;

  -- 2. Mark escrow as disputed
  UPDATE escrow_payments
  SET status = 'disputed', dispute_reason = p_reason
  WHERE booking_id = p_booking_id;

  -- 3. Update linked job if exists
  UPDATE jobs
  SET status = 'disputed'
  WHERE id IN (SELECT job_id FROM bookings WHERE id = p_booking_id AND job_id IS NOT NULL);

  -- 4. Create report for admin review
  INSERT INTO reports (
    reporter_id, reported_user_id, related_type, related_id,
    reason, description, status
  )
  VALUES (
    v_user_id, v_booking.provider_id, 'booking', p_booking_id,
    'Booking dispute', p_reason, 'pending'
  )
  RETURNING id INTO v_report_id;

  -- 5. Notify provider
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.provider_id,
    'booking_confirmed',
    'Booking disputed',
    'The client has raised a dispute on your booking. An admin will review.',
    p_booking_id
  );

  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 10. REQUEST WITHDRAWAL (server-side validated)
-- Verifies available balance server-side before creating withdrawal request.
-- ============================================================================
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_amount DECIMAL,
  p_currency TEXT DEFAULT 'CAD',
  p_note TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_provider BOOLEAN;
  v_total_earned DECIMAL(10,2);
  v_total_withdrawn DECIMAL(10,2);
  v_available DECIMAL(10,2);
  v_withdrawal_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero';
  END IF;

  IF p_amount < 50 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $50';
  END IF;

  -- Verify user is a provider
  SELECT EXISTS (
    SELECT 1 FROM provider_profiles WHERE user_id = v_user_id
  ) INTO v_is_provider;

  IF NOT v_is_provider THEN
    RAISE EXCEPTION 'Only providers can request withdrawals';
  END IF;

  -- Compute available balance from escrow payments and existing withdrawals
  SELECT COALESCE(SUM(provider_amount), 0)
  INTO v_total_earned
  FROM escrow_payments
  WHERE provider_id = v_user_id AND status = 'released';

  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_withdrawn
  FROM withdrawal_requests
  WHERE provider_id = v_user_id
    AND status NOT IN ('rejected', 'cancelled')
  FOR UPDATE;  -- Lock to prevent race condition

  v_available := GREATEST(0, v_total_earned - v_total_withdrawn);

  IF p_amount > v_available THEN
    RAISE EXCEPTION 'Insufficient available balance. Available: $%, Requested: $%', v_available, p_amount;
  END IF;

  INSERT INTO withdrawal_requests (
    provider_id, amount, currency, note, status, requested_at
  )
  VALUES (
    v_user_id, p_amount, UPPER(p_currency),
    NULLIF(TRIM(COALESCE(p_note, '')), ''),
    'pending', NOW()
  )
  RETURNING id INTO v_withdrawal_id;

  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- GRANT EXECUTE on new functions
-- ============================================================================
GRANT EXECUTE ON FUNCTION compute_wallet_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_direct_booking(UUID, TEXT, TEXT, TEXT, TEXT, DECIMAL, JSONB, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decline_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_booking(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION start_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION request_withdrawal(DECIMAL, TEXT, TEXT) TO authenticated;
-- Re-grant existing functions (they were re-created)
GRANT EXECUTE ON FUNCTION accept_quote(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION release_escrow(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION dispute_booking(UUID, TEXT) TO authenticated;

-- ============================================================================
-- RLS POLICIES — LOCK DOWN BOOKINGS
-- Remove permissive update policies and replace with restrictive ones.
-- Users can only read their own bookings; all mutations go through RPCs.
-- ============================================================================

-- Drop existing overly-permissive policies if they exist
DO $$
BEGIN
  -- Bookings
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can update own bookings') THEN
    DROP POLICY "Users can update own bookings" ON bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Clients can insert bookings') THEN
    DROP POLICY "Clients can insert bookings" ON bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Clients can create bookings') THEN
    DROP POLICY "Clients can create bookings" ON bookings;
  END IF;

  -- Escrow
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrow_payments' AND policyname = 'Users can update own escrow') THEN
    DROP POLICY "Users can update own escrow" ON escrow_payments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrow_payments' AND policyname = 'Clients can insert escrow') THEN
    DROP POLICY "Clients can insert escrow" ON escrow_payments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrow_payments' AND policyname = 'Clients can create escrow payments') THEN
    DROP POLICY "Clients can create escrow payments" ON escrow_payments;
  END IF;

  -- Withdrawal requests
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'withdrawal_requests' AND policyname = 'Providers can insert withdrawals') THEN
    DROP POLICY "Providers can insert withdrawals" ON withdrawal_requests;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'withdrawal_requests' AND policyname = 'Providers can create withdrawal requests') THEN
    DROP POLICY "Providers can create withdrawal requests" ON withdrawal_requests;
  END IF;
END$$;

-- Enable RLS on all relevant tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Bookings: users can read their own (client or provider)
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = provider_id
  );

-- Bookings: NO direct insert/update/delete — all through RPCs (SECURITY DEFINER)
-- The RPCs run as the function owner, bypassing RLS.

-- Escrow: users can read their own
CREATE POLICY "escrow_select_own" ON escrow_payments
  FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = provider_id
  );

-- Withdrawal requests: providers can read their own
CREATE POLICY "withdrawals_select_own" ON withdrawal_requests
  FOR SELECT USING (
    auth.uid() = provider_id
  );

-- Quotes: providers can insert their own quotes
-- (quote creation is a simple insert and doesn't need atomic guarantees)
-- Keep existing SELECT policy, add constrained INSERT
CREATE POLICY "quotes_insert_own" ON quotes
  FOR INSERT WITH CHECK (
    auth.uid() = provider_id
    AND status = 'pending'
  );

-- Quotes: providers can withdraw their own pending quotes
CREATE POLICY "quotes_update_withdraw" ON quotes
  FOR UPDATE USING (
    auth.uid() = provider_id
    AND status IN ('pending', 'client_messaged')
  )
  WITH CHECK (
    status = 'withdrawn'
  );
