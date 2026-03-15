-- Improve booking notifications so clients can see who acted and open the
-- relevant booking context from the notification feed.

CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_balance DECIMAL(10,2);
  v_provider_name TEXT;
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

  v_balance := compute_wallet_balance(v_booking.client_id);
  IF v_balance < v_booking.amount THEN
    RAISE EXCEPTION 'Client has insufficient wallet balance to cover this booking';
  END IF;

  SELECT full_name
  INTO v_provider_name
  FROM profiles
  WHERE id = v_booking.provider_id;

  UPDATE escrow_payments
  SET status = 'held', held_at = NOW()
  WHERE booking_id = p_booking_id;

  UPDATE bookings
  SET status = 'confirmed', confirmed_at = NOW(), payment_status = 'held'
  WHERE id = p_booking_id;

  INSERT INTO notifications (user_id, type, title, message, link_url, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    COALESCE(v_provider_name, 'Your provider') || ' confirmed your ' || COALESCE(v_booking.service_type, 'service') || ' booking',
    COALESCE(v_provider_name, 'Your provider') || ' confirmed your ' || COALESCE(v_booking.service_type, 'service') || ' booking. Funds are now held in escrow and you can open the booking for full details.',
    '/dashboard/client/bookings',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION start_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_provider_name TEXT;
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

  SELECT full_name
  INTO v_provider_name
  FROM profiles
  WHERE id = v_booking.provider_id;

  UPDATE bookings
  SET status = 'in_progress', started_at = NOW()
  WHERE id = p_booking_id;

  IF v_booking.job_id IS NOT NULL THEN
    UPDATE jobs
    SET status = 'in_progress'
    WHERE id = v_booking.job_id;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, link_url, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    COALESCE(v_provider_name, 'Your provider') || ' started your ' || COALESCE(v_booking.service_type, 'service') || ' booking',
    COALESCE(v_provider_name, 'Your provider') || ' has started working on your ' || COALESCE(v_booking.service_type, 'service') || ' booking. Open the booking to view details or send a message.',
    '/dashboard/client/bookings',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking RECORD;
  v_provider_name TEXT;
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

  SELECT full_name
  INTO v_provider_name
  FROM profiles
  WHERE id = v_booking.provider_id;

  UPDATE bookings
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_booking_id;

  IF v_booking.job_id IS NOT NULL THEN
    UPDATE jobs
    SET status = 'completed', completed_at = NOW()
    WHERE id = v_booking.job_id;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, link_url, related_id)
  VALUES (
    v_booking.client_id,
    'booking_confirmed',
    COALESCE(v_provider_name, 'Your provider') || ' completed your ' || COALESCE(v_booking.service_type, 'service') || ' booking',
    COALESCE(v_provider_name, 'Your provider') || ' marked your ' || COALESCE(v_booking.service_type, 'service') || ' booking as complete. Review the work and release payment when you are satisfied.',
    '/dashboard/client/bookings',
    p_booking_id
  );
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
  v_client_name TEXT;
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
  FOR UPDATE;

  IF v_escrow IS NULL THEN
    RAISE EXCEPTION 'Escrow payment not found for this booking';
  END IF;

  IF v_escrow.status NOT IN ('pending', 'held') THEN
    RAISE EXCEPTION 'Escrow already processed (status: %)', v_escrow.status;
  END IF;

  SELECT full_name
  INTO v_client_name
  FROM profiles
  WHERE id = v_booking.client_id;

  UPDATE escrow_payments
  SET status = 'released', released_at = NOW()
  WHERE booking_id = p_booking_id;

  UPDATE bookings
  SET payment_status = 'released'
  WHERE id = p_booking_id;

  UPDATE provider_profiles
  SET
    jobs_completed = jobs_completed + 1,
    total_earned = total_earned + v_escrow.provider_amount
  WHERE user_id = v_booking.provider_id;

  UPDATE client_profiles
  SET total_spent = total_spent + v_booking.amount
  WHERE user_id = v_booking.client_id;

  INSERT INTO notifications (user_id, type, title, message, link_url, related_id)
  VALUES (
    v_booking.provider_id,
    'payment_released',
    COALESCE(v_client_name, 'Your client') || ' released payment for your ' || COALESCE(v_booking.service_type, 'service') || ' booking',
    COALESCE(v_client_name, 'Your client') || ' released $' || v_escrow.provider_amount || ' for your ' || COALESCE(v_booking.service_type, 'service') || ' booking. Open your wallet to review the payout.',
    '/dashboard/provider/wallet',
    p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

UPDATE notifications AS n
SET
  title = COALESCE(p.full_name, 'Your provider') || ' confirmed your ' || COALESCE(b.service_type, 'service') || ' booking',
  message = COALESCE(p.full_name, 'Your provider') || ' confirmed your ' || COALESCE(b.service_type, 'service') || ' booking. Funds are now held in escrow and you can open the booking for full details.',
  link_url = COALESCE(n.link_url, '/dashboard/client/bookings')
FROM bookings AS b
LEFT JOIN profiles AS p ON p.id = b.provider_id
WHERE n.related_id = b.id
  AND n.type = 'booking_confirmed'
  AND n.title = 'Booking confirmed';

UPDATE notifications AS n
SET
  title = COALESCE(p.full_name, 'Your provider') || ' started your ' || COALESCE(b.service_type, 'service') || ' booking',
  message = COALESCE(p.full_name, 'Your provider') || ' has started working on your ' || COALESCE(b.service_type, 'service') || ' booking. Open the booking to view details or send a message.',
  link_url = COALESCE(n.link_url, '/dashboard/client/bookings')
FROM bookings AS b
LEFT JOIN profiles AS p ON p.id = b.provider_id
WHERE n.related_id = b.id
  AND n.type = 'booking_confirmed'
  AND n.title = 'Work started';

UPDATE notifications AS n
SET
  title = COALESCE(p.full_name, 'Your provider') || ' completed your ' || COALESCE(b.service_type, 'service') || ' booking',
  message = COALESCE(p.full_name, 'Your provider') || ' marked your ' || COALESCE(b.service_type, 'service') || ' booking as complete. Review the work and release payment when you are satisfied.',
  link_url = COALESCE(n.link_url, '/dashboard/client/bookings')
FROM bookings AS b
LEFT JOIN profiles AS p ON p.id = b.provider_id
WHERE n.related_id = b.id
  AND n.type = 'booking_confirmed'
  AND n.title = 'Job completed — please review';

UPDATE notifications AS n
SET
  title = COALESCE(p.full_name, 'Your client') || ' released payment for your ' || COALESCE(b.service_type, 'service') || ' booking',
  message = COALESCE(p.full_name, 'Your client') || ' released $' || e.provider_amount || ' for your ' || COALESCE(b.service_type, 'service') || ' booking. Open your wallet to review the payout.',
  link_url = COALESCE(n.link_url, '/dashboard/provider/wallet')
FROM bookings AS b
JOIN escrow_payments AS e ON e.booking_id = b.id
LEFT JOIN profiles AS p ON p.id = b.client_id
WHERE n.related_id = b.id
  AND n.type = 'payment_released'
  AND n.title = 'Payment released!';