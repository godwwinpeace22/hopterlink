-- ============================================================================
-- DIRECT BOOKING SNAPSHOTS + POST-COMPLETION BONUSES
-- - Computes direct-booking amounts from provider hourly rate and requested hours
-- - Supports optional per-service minimum billable hours
-- - Stores booking pricing snapshots for auditability
-- - Adds post-completion booking bonuses paid from client wallet to provider
-- ============================================================================

ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS service_minimum_hours JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hourly_rate_snapshot DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS requested_hours DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS billable_hours DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS minimum_billable_hours_snapshot DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS base_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bonus_amount DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE bookings
SET requested_hours = COALESCE(requested_hours, duration_hours),
    billable_hours = COALESCE(billable_hours, duration_hours),
    base_amount = COALESCE(base_amount, amount),
    hourly_rate_snapshot = COALESCE(
      hourly_rate_snapshot,
      CASE
        WHEN duration_hours IS NOT NULL AND duration_hours > 0
          THEN ROUND(amount / duration_hours, 2)
        ELSE NULL
      END
    )
WHERE requested_hours IS NULL
   OR billable_hours IS NULL
   OR base_amount IS NULL
   OR hourly_rate_snapshot IS NULL;

UPDATE escrow_payments
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{payment_kind}',
  '"booking_base"',
  true
)
WHERE booking_id IS NOT NULL
  AND COALESCE(metadata->>'payment_kind', '') = '';

CREATE OR REPLACE FUNCTION create_direct_booking(
  p_provider_id UUID,
  p_service_type TEXT,
  p_description TEXT,
  p_scheduled_date TEXT,
  p_scheduled_time TEXT DEFAULT NULL,
  p_duration_hours DECIMAL DEFAULT NULL,
  p_location JSONB DEFAULT '{}'::jsonb,
  p_special_instructions TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance DECIMAL(10,2);
  v_platform_fee DECIMAL(10,2);
  v_provider_amount DECIMAL(10,2);
  v_booking_id UUID;
  v_hourly_rate DECIMAL(10,2);
  v_service_minimums JSONB;
  v_minimum_hours_text TEXT;
  v_minimum_billable_hours DECIMAL(4,2);
  v_requested_hours DECIMAL(4,2);
  v_billable_hours DECIMAL(4,2);
  v_amount DECIMAL(10,2);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_user_id = p_provider_id THEN
    RAISE EXCEPTION 'Cannot book yourself';
  END IF;

  IF p_service_type IS NULL OR LENGTH(TRIM(p_service_type)) = 0 THEN
    RAISE EXCEPTION 'Service type is required';
  END IF;

  IF p_duration_hours IS NULL OR p_duration_hours <= 0 THEN
    RAISE EXCEPTION 'Requested hours must be greater than zero';
  END IF;

  SELECT hourly_rate, service_minimum_hours
  INTO v_hourly_rate, v_service_minimums
  FROM provider_profiles
  WHERE user_id = p_provider_id;

  IF v_hourly_rate IS NULL OR v_hourly_rate <= 0 THEN
    RAISE EXCEPTION 'This provider is not available for direct hourly booking';
  END IF;

  v_requested_hours := ROUND(p_duration_hours::numeric, 2);
  v_minimum_hours_text := NULLIF(
    TRIM(COALESCE(v_service_minimums ->> TRIM(p_service_type), '')),
    ''
  );

  IF v_minimum_hours_text ~ '^[0-9]+(\.[0-9]+)?$' THEN
    v_minimum_billable_hours := ROUND(v_minimum_hours_text::numeric, 2);
  ELSE
    v_minimum_billable_hours := NULL;
  END IF;

  IF v_minimum_billable_hours IS NOT NULL AND v_minimum_billable_hours <= 0 THEN
    v_minimum_billable_hours := NULL;
  END IF;

  v_billable_hours := GREATEST(
    v_requested_hours,
    COALESCE(v_minimum_billable_hours, v_requested_hours)
  );
  v_amount := ROUND(v_hourly_rate * v_billable_hours, 2);

  v_balance := compute_wallet_balance(v_user_id);
  IF v_balance < v_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: $%, Required: $%', v_balance, v_amount;
  END IF;

  v_platform_fee := ROUND(v_amount * 0.10, 2);
  v_provider_amount := v_amount - v_platform_fee;

  INSERT INTO bookings (
    client_id, provider_id,
    service_type, description,
    scheduled_date, scheduled_time, duration_hours,
    requested_hours, billable_hours, minimum_billable_hours_snapshot,
    hourly_rate_snapshot, base_amount, bonus_amount,
    location, amount,
    payment_method, payment_status,
    special_instructions, status
  )
  VALUES (
    v_user_id, p_provider_id,
    TRIM(p_service_type), NULLIF(TRIM(COALESCE(p_description, '')), ''),
    p_scheduled_date::TIMESTAMPTZ, NULLIF(TRIM(COALESCE(p_scheduled_time, '')), ''), v_requested_hours,
    v_requested_hours, v_billable_hours, v_minimum_billable_hours,
    v_hourly_rate, v_amount, 0,
    p_location, v_amount,
    'wallet', 'pending',
    NULLIF(TRIM(COALESCE(p_special_instructions, '')), ''), 'pending'
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO escrow_payments (
    booking_id, client_id, provider_id,
    amount, platform_fee, provider_amount,
    status, metadata
  )
  VALUES (
    v_booking_id, v_user_id, p_provider_id,
    v_amount, v_platform_fee, v_provider_amount,
    'pending', jsonb_build_object('payment_kind', 'booking_base')
  );

  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    p_provider_id,
    'booking_confirmed',
    'New booking request',
    'You have a new ' || TRIM(p_service_type) || ' booking request for $' || v_amount || '. Please confirm or decline.',
    v_booking_id
  );

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

  v_balance := compute_wallet_balance(v_user_id);
  IF v_balance < v_quote.amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: $%, Required: $%', v_balance, v_quote.amount;
  END IF;

  UPDATE quotes
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_quote_id;

  UPDATE quotes
  SET status = 'rejected'
  WHERE job_id = v_quote.job_id
    AND id <> p_quote_id
    AND status = 'pending';

  UPDATE jobs
  SET status = 'accepted'
  WHERE id = v_quote.job_id;

  v_escrow_amount := v_quote.amount;
  v_platform_fee := ROUND(v_escrow_amount * 0.10, 2);
  v_provider_amount := v_escrow_amount - v_platform_fee;

  INSERT INTO bookings (
    client_id, provider_id, job_id, quote_id,
    service_type, description, scheduled_date,
    amount, base_amount, bonus_amount,
    status, payment_status, payment_method, location
  )
  VALUES (
    v_user_id, v_quote.provider_id, v_quote.job_id, p_quote_id,
    v_job.category, v_job.description, NOW(),
    v_escrow_amount, v_escrow_amount, 0,
    'confirmed', 'held', 'wallet', v_job.location
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO escrow_payments (
    booking_id, client_id, provider_id,
    amount, platform_fee, provider_amount,
    status, held_at, metadata
  )
  VALUES (
    v_booking_id, v_user_id, v_quote.provider_id,
    v_escrow_amount, v_platform_fee, v_provider_amount,
    'held', NOW(), jsonb_build_object('payment_kind', 'booking_base')
  );

  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_quote.provider_id,
    'quote_accepted',
    'Quote accepted',
    'Your quote for "' || v_job.title || '" has been accepted. Funds are held in escrow.',
    v_booking_id
  );

  FOR v_other_provider IN
    SELECT provider_id
    FROM quotes
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

CREATE OR REPLACE FUNCTION release_escrow(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_escrow RECORD;
  v_booking_amount DECIMAL(10,2);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT b.id, b.client_id, b.provider_id, b.status, b.amount, b.base_amount
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

  SELECT e.id, e.status, e.provider_amount
  INTO v_escrow
  FROM escrow_payments e
  WHERE e.booking_id = p_booking_id
    AND COALESCE(e.metadata->>'payment_kind', 'booking_base') = 'booking_base'
  FOR UPDATE;

  IF v_escrow IS NULL THEN
    RAISE EXCEPTION 'Escrow payment not found for this booking';
  END IF;

  IF v_escrow.status NOT IN ('pending', 'held') THEN
    RAISE EXCEPTION 'Escrow already processed (status: %)', v_escrow.status;
  END IF;

  UPDATE escrow_payments
  SET status = 'released', released_at = NOW()
  WHERE id = v_escrow.id;

  UPDATE bookings
  SET payment_status = 'released'
  WHERE id = p_booking_id;

  UPDATE provider_profiles
  SET
    jobs_completed = jobs_completed + 1,
    total_earned = total_earned + v_escrow.provider_amount
  WHERE user_id = v_booking.provider_id;

  v_booking_amount := COALESCE(v_booking.base_amount, v_booking.amount);

  UPDATE client_profiles
  SET total_spent = total_spent + v_booking_amount
  WHERE user_id = v_booking.client_id;

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

CREATE OR REPLACE FUNCTION send_booking_bonus(
  p_booking_id UUID,
  p_amount DECIMAL,
  p_note TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_balance DECIMAL(10,2);
  v_payment_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Bonus amount must be greater than zero';
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
    RAISE EXCEPTION 'Only the client can send a bonus';
  END IF;

  IF v_booking.status <> 'completed' THEN
    RAISE EXCEPTION 'Bonuses can only be sent after work is completed';
  END IF;

  v_balance := compute_wallet_balance(v_user_id);
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Available: $%, Required: $%', v_balance, p_amount;
  END IF;

  INSERT INTO escrow_payments (
    booking_id, client_id, provider_id,
    amount, platform_fee, provider_amount,
    status, released_at, metadata
  )
  VALUES (
    p_booking_id, v_user_id, v_booking.provider_id,
    ROUND(p_amount, 2), 0, ROUND(p_amount, 2),
    'released', NOW(), jsonb_build_object(
      'payment_kind', 'booking_bonus',
      'note', NULLIF(TRIM(COALESCE(p_note, '')), '')
    )
  )
  RETURNING id INTO v_payment_id;

  UPDATE bookings
  SET bonus_amount = COALESCE(bonus_amount, 0) + ROUND(p_amount, 2),
      amount = amount + ROUND(p_amount, 2)
  WHERE id = p_booking_id;

  UPDATE provider_profiles
  SET total_earned = total_earned + ROUND(p_amount, 2)
  WHERE user_id = v_booking.provider_id;

  UPDATE client_profiles
  SET total_spent = total_spent + ROUND(p_amount, 2)
  WHERE user_id = v_user_id;

  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.provider_id,
    'payment_released',
    'You received a bonus',
    'A bonus of $' || ROUND(p_amount, 2) || ' was sent for your ' || v_booking.service_type || ' booking.',
    p_booking_id
  );

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION create_direct_booking(UUID, TEXT, TEXT, TEXT, TEXT, DECIMAL, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION release_escrow(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_booking_bonus(UUID, DECIMAL, TEXT) TO authenticated;