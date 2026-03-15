-- ============================================================================
-- NOTIFICATION TRIGGERS
--
-- Move notification creation from the frontend into the database layer.
-- Events already handled by RPCs (accept_quote, confirm_booking, etc.)
-- are NOT duplicated here.
--
-- This migration adds triggers for:
--   1. quote_received   — when a quote is inserted or re-submitted after withdrawal
--   2. message_received — when a message is inserted
--   3. review_received  — when a review is inserted
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Reusable helper: create_notification()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link_url, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_link_url, p_related_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 1. Notify client when a quote is submitted (INSERT or re-submit after withdrawal)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_quote_received()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
  v_job_title TEXT;
BEGIN
  -- Only fire for new pending quotes
  -- INSERT: NEW row must be pending
  -- UPDATE (upsert re-submit): status changed TO pending from something else
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'pending' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status <> 'pending' OR OLD.status = 'pending' THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT client_id, title INTO v_client_id, v_job_title
  FROM jobs WHERE id = NEW.job_id;

  IF v_client_id IS NOT NULL THEN
    PERFORM create_notification(
      v_client_id,
      'quote_received',
      'New quote received',
      'You received a new quote for "' || COALESCE(v_job_title, 'your job') || '".',
      NULL,
      NEW.job_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_quote_received
AFTER INSERT OR UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION notify_quote_received();

-- ---------------------------------------------------------------------------
-- 2. Notify recipient when a message is sent
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_message_received()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  -- Skip self-messages (shouldn't happen, but be safe)
  IF NEW.sender_id = NEW.recipient_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_sender_name
  FROM profiles WHERE id = NEW.sender_id;

  PERFORM create_notification(
    NEW.recipient_id,
    'message_received',
    'New message from ' || COALESCE(v_sender_name, 'a user'),
    LEFT(NEW.content, 120),
    NULL,
    COALESCE(NEW.booking_id, NEW.job_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_message_received
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_message_received();

-- ---------------------------------------------------------------------------
-- 3. Notify reviewee when a review is submitted
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_review_received()
RETURNS TRIGGER AS $$
DECLARE
  v_reviewer_name TEXT;
BEGIN
  -- Don't notify yourself
  IF NEW.reviewer_id = NEW.reviewee_id THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO v_reviewer_name
  FROM profiles WHERE id = NEW.reviewer_id;

  PERFORM create_notification(
    NEW.reviewee_id,
    'review_received',
    'New review received',
    COALESCE(v_reviewer_name, 'Someone') || ' left you a ' || NEW.rating || '-star review.',
    NULL,
    NEW.booking_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_review_received
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_review_received();
