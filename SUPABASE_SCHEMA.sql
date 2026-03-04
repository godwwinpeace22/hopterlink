-- Fixers Hive - Complete Supabase Schema Design
-- Generated: 2026-01-23
-- Based on: SYSTEM_ARCHITECTURE.md + Frontend Audit

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'client_messaged', 'withdrawn');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE verification_status AS ENUM ('not_started', 'pending', 'approved', 'rejected', 'expired');
CREATE TYPE document_type AS ENUM ('id', 'insurance', 'certification', 'license', 'portfolio');
CREATE TYPE payment_method AS ENUM ('card', 'cash', 'escrow', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'held', 'released', 'refunded', 'disputed');
CREATE TYPE notification_type AS ENUM ('job_posted', 'quote_received', 'quote_accepted', 'message_received', 'booking_confirmed', 'payment_released', 'review_received', 'verification_approved', 'reward_earned');
CREATE TYPE message_type AS ENUM ('text', 'system', 'attachment', 'quote_update', 'booking_update');
CREATE TYPE reward_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE role_membership_state AS ENUM ('not_started', 'onboarding', 'pending_review', 'approved', 'rejected', 'suspended');

-- ============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  location JSONB, -- {city, state, coordinates, address}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- USER ROLE MEMBERSHIPS
-- ============================================================================
CREATE TABLE user_role_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  state role_membership_state NOT NULL DEFAULT 'not_started',
  active BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  suspended_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role),
  CONSTRAINT user_role_memberships_active_requires_approved
    CHECK ((NOT active) OR state = 'approved')
);

CREATE INDEX idx_user_role_memberships_user ON user_role_memberships(user_id);
CREATE INDEX idx_user_role_memberships_state ON user_role_memberships(state);
CREATE UNIQUE INDEX idx_user_role_memberships_one_active ON user_role_memberships(user_id) WHERE active = TRUE;

-- ============================================================================
-- CLIENT PROFILES
-- ============================================================================
CREATE TABLE client_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  jobs_posted INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  preferred_categories TEXT[],
  saved_providers UUID[],
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROVIDER PROFILES
-- ============================================================================
CREATE TABLE provider_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  services TEXT[] NOT NULL, -- Array of service categories
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  service_areas TEXT[], -- Cities/regions served
  availability JSONB DEFAULT '{}'::jsonb, -- {dayOfWeek: {start, end, enabled}}
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  response_time INTEGER, -- Average in minutes
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  verification_status verification_status DEFAULT 'not_started',
  verified_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  portfolio_urls TEXT[],
  certifications TEXT[],
  insurance_expiry DATE,
  background_check_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROVIDER VERIFICATION DOCUMENTS
-- ============================================================================
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status verification_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  expiry_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(provider_id, document_type)
);

-- ============================================================================
-- JOBS
-- ============================================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL, -- {address, city, coordinates}
  urgency TEXT, -- 'flexible', 'within_week', 'asap'
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  preferred_date TIMESTAMPTZ,
  photo_urls TEXT[],
  status job_status DEFAULT 'open',
  views_count INTEGER DEFAULT 0,
  quotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- ============================================================================
-- QUOTES
-- ============================================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  estimated_duration TEXT, -- "2-3 days", "1 week"
  timeline_days INTEGER,
  message TEXT,
  status quote_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(job_id, provider_id)
);

CREATE INDEX idx_quotes_job_id ON quotes(job_id);
CREATE INDEX idx_quotes_provider_id ON quotes(provider_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- ============================================================================
-- BOOKINGS (Direct bookings + Accepted quotes)
-- ============================================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  scheduled_time TEXT,
  duration_hours DECIMAL(4,2),
  location JSONB NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  status booking_status DEFAULT 'pending',
  photo_urls TEXT[],
  special_instructions TEXT,
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);

-- ============================================================================
-- MESSAGES (Job-specific + Direct messaging)
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  message_type message_type DEFAULT 'text',
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- REVIEWS
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT, -- Provider can respond to reviews
  response_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT FALSE, -- Only from completed bookings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  related_id UUID, -- job_id, quote_id, booking_id, etc.
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- WALLET TOP-UPS (STRIPE)
-- ============================================================================
CREATE TABLE wallet_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'cad',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  provider TEXT NOT NULL DEFAULT 'stripe' CHECK (provider = 'stripe'),
  idempotency_key TEXT NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  checkout_url TEXT,
  failure_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  succeeded_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX idx_wallet_topups_user_created_at ON wallet_topups(user_id, created_at DESC);
CREATE INDEX idx_wallet_topups_status ON wallet_topups(status);

CREATE TABLE stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  payload JSONB NOT NULL
);

-- ============================================================================
-- ESCROW PAYMENTS
-- ============================================================================
CREATE TABLE escrow_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  provider_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  provider_amount DECIMAL(10,2) NOT NULL, -- amount - platform_fee
  payment_intent_id TEXT, -- Stripe payment intent
  status payment_status DEFAULT 'pending',
  held_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_escrow_booking_id ON escrow_payments(booking_id);
CREATE INDEX idx_escrow_status ON escrow_payments(status);

-- ============================================================================
-- REWARDS SYSTEM
-- ============================================================================
CREATE TABLE client_rewards (
  user_id UUID PRIMARY KEY REFERENCES client_profiles(user_id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  cashback DECIMAL(10,2) DEFAULT 0,
  tier reward_tier DEFAULT 'bronze',
  lifetime_points INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reward_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus'
  points INTEGER NOT NULL,
  cashback DECIMAL(10,2) DEFAULT 0,
  description TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_reward_transactions_user_id ON reward_transactions(user_id);

CREATE TABLE reward_marketplace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  discount_amount DECIMAL(10,2),
  discount_percent DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REFERRALS
-- ============================================================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referee_id UUID NOT NULL REFERENCES profiles(id),
  referral_code TEXT NOT NULL,
  reward_points INTEGER DEFAULT 0,
  reward_cashback DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referee_id)
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);

-- ============================================================================
-- SAVED SEARCHES
-- ============================================================================
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- {category, location, budget, etc}
  notify_on_match BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REPORTED CONTENT
-- ============================================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  related_type TEXT, -- 'job', 'quote', 'message', 'review', 'user'
  related_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_role_memberships_updated_at BEFORE UPDATE ON user_role_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrow_payments_updated_at BEFORE UPDATE ON escrow_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_rewards_updated_at BEFORE UPDATE ON client_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_topups_updated_at BEFORE UPDATE ON wallet_topups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update provider rating when new review is added
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_rating_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();

-- Increment jobs posted count
CREATE OR REPLACE FUNCTION increment_jobs_posted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE client_profiles
  SET jobs_posted = jobs_posted + 1
  WHERE user_id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_jobs_posted_trigger
AFTER INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION increment_jobs_posted();

-- Increment quotes count on job
CREATE OR REPLACE FUNCTION increment_quotes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs
  SET quotes_count = quotes_count + 1
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_quotes_count_trigger
AFTER INSERT ON quotes
FOR EACH ROW
EXECUTE FUNCTION increment_quotes_count();

-- Role Membership RPCs
CREATE OR REPLACE FUNCTION start_role_onboarding(p_role user_role)
RETURNS user_role_memberships AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_membership user_role_memberships;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO user_role_memberships (
    user_id,
    role,
    state,
    active,
    onboarding_started_at,
    metadata
  )
  VALUES (
    v_user_id,
    p_role,
    'onboarding',
    FALSE,
    NOW(),
    jsonb_build_object('source', 'start_role_onboarding')
  )
  ON CONFLICT (user_id, role)
  DO UPDATE
  SET state = CASE
      WHEN user_role_memberships.state = 'approved' THEN user_role_memberships.state
      WHEN user_role_memberships.state = 'suspended' THEN user_role_memberships.state
      ELSE 'onboarding'::role_membership_state
    END,
    onboarding_started_at = COALESCE(user_role_memberships.onboarding_started_at, NOW()),
    metadata = COALESCE(user_role_memberships.metadata, '{}'::jsonb)
      || jsonb_build_object('source', 'start_role_onboarding')
  RETURNING * INTO v_membership;

  RETURN v_membership;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION submit_role_onboarding(p_role user_role)
RETURNS user_role_memberships AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_auto_approve BOOLEAN := (p_role = 'client');
  v_has_active_approved BOOLEAN;
  v_membership user_role_memberships;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = v_user_id
      AND active = TRUE
      AND state = 'approved'
  ) INTO v_has_active_approved;

  INSERT INTO user_role_memberships (
    user_id,
    role,
    state,
    active,
    onboarding_started_at,
    onboarding_completed_at,
    metadata
  )
  VALUES (
    v_user_id,
    p_role,
    CASE WHEN v_auto_approve THEN 'approved'::role_membership_state ELSE 'pending_review'::role_membership_state END,
    CASE WHEN v_auto_approve AND NOT v_has_active_approved THEN TRUE ELSE FALSE END,
    NOW(),
    NOW(),
    jsonb_build_object('source', 'submit_role_onboarding')
  )
  ON CONFLICT (user_id, role)
  DO UPDATE
  SET state = CASE
      WHEN user_role_memberships.state = 'suspended' THEN user_role_memberships.state
      WHEN user_role_memberships.state = 'approved' THEN user_role_memberships.state
      WHEN v_auto_approve THEN 'approved'::role_membership_state
      ELSE 'pending_review'::role_membership_state
    END,
    onboarding_started_at = COALESCE(user_role_memberships.onboarding_started_at, NOW()),
    onboarding_completed_at = NOW(),
    active = CASE
      WHEN user_role_memberships.state = 'approved' THEN user_role_memberships.active
      WHEN v_auto_approve AND NOT v_has_active_approved THEN TRUE
      ELSE FALSE
    END,
    metadata = COALESCE(user_role_memberships.metadata, '{}'::jsonb)
      || jsonb_build_object('source', 'submit_role_onboarding')
  RETURNING * INTO v_membership;

  RETURN v_membership;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION switch_active_role(p_role user_role)
RETURNS user_role_memberships AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_membership user_role_memberships;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT *
  INTO v_membership
  FROM user_role_memberships
  WHERE user_id = v_user_id
    AND role = p_role
  LIMIT 1;

  IF v_membership.id IS NULL THEN
    RAISE EXCEPTION 'Role membership not found';
  END IF;

  IF v_membership.state <> 'approved' THEN
    RAISE EXCEPTION 'Role membership is not approved';
  END IF;

  UPDATE user_role_memberships
  SET active = FALSE
  WHERE user_id = v_user_id
    AND active = TRUE;

  UPDATE user_role_memberships
  SET active = TRUE
  WHERE id = v_membership.id
  RETURNING * INTO v_membership;

  RETURN v_membership;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION start_role_onboarding(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_role_onboarding(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION switch_active_role(user_role) TO authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Role memberships: Owner can view
CREATE POLICY "Role memberships viewable by owner" ON user_role_memberships FOR SELECT USING (auth.uid() = user_id);

-- Client Profiles
CREATE POLICY "Client profiles viewable by owner" ON client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Client profiles updatable by owner" ON client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client profiles insertable by owner" ON client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Provider Profiles: Public read, owner write
CREATE POLICY "Provider profiles viewable by everyone" ON provider_profiles FOR SELECT USING (true);
CREATE POLICY "Provider profiles updatable by owner" ON provider_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Provider profiles insertable by owner" ON provider_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verification Documents: Owner and admins only
CREATE POLICY "Verification docs viewable by owner" ON verification_documents FOR SELECT USING (
  auth.uid() = provider_id OR
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND state = 'approved'
  )
);
CREATE POLICY "Verification docs insertable by owner" ON verification_documents FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Jobs: Public read, owner can insert/update/delete
CREATE POLICY "Jobs viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs insertable by clients" ON jobs FOR INSERT WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'client'
      AND state = 'approved'
  )
);
CREATE POLICY "Jobs updatable by owner or provider" ON jobs FOR UPDATE USING (
  auth.uid() = client_id OR
  EXISTS (
    SELECT 1
    FROM bookings
    WHERE bookings.job_id = jobs.id
      AND bookings.provider_id = auth.uid()
  )
);
CREATE POLICY "Jobs deletable by owner" ON jobs FOR DELETE USING (auth.uid() = client_id);

-- Quotes: Job owner + quote provider can view, provider can insert
CREATE POLICY "Quotes viewable by job owner and provider" ON quotes FOR SELECT USING (
  auth.uid() = provider_id OR 
  auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_id)
);
CREATE POLICY "Quotes insertable by providers" ON quotes FOR INSERT WITH CHECK (
  auth.uid() = provider_id AND 
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'provider'
      AND state = 'approved'
  )
);
CREATE POLICY "Quotes updatable by provider or job owner" ON quotes FOR UPDATE USING (
  auth.uid() = provider_id OR
  auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_id)
);

-- Bookings: Client and provider involved can view/update
CREATE POLICY "Bookings viewable by participants" ON bookings FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = provider_id
);
CREATE POLICY "Bookings insertable by clients" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Bookings updatable by participants" ON bookings FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = provider_id
);

-- Messages: Sender and recipient can view, sender can insert
CREATE POLICY "Messages viewable by participants" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Messages insertable by sender" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Messages updatable by recipient (read status)" ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Reviews: Public read, booking participants can write
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews insertable by reviewer" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND (client_id = auth.uid() OR provider_id = auth.uid()) AND status = 'completed')
);
CREATE POLICY "Reviews updatable by reviewee (response)" ON reviews FOR UPDATE USING (auth.uid() = reviewee_id);

-- Notifications: Owner only
CREATE POLICY "Notifications viewable by owner" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications updatable by owner" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Wallet topups: Owner can view only
CREATE POLICY "Wallet topups viewable by owner" ON wallet_topups FOR SELECT USING (auth.uid() = user_id);

-- Escrow: Participants and admins
CREATE POLICY "Escrow viewable by participants" ON escrow_payments FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() = provider_id OR
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND state = 'approved'
  )
);

CREATE POLICY "Escrow insertable by client" ON escrow_payments FOR INSERT WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (
    SELECT 1
    FROM bookings
    WHERE id = booking_id
      AND client_id = auth.uid()
  )
);

CREATE POLICY "Escrow updatable by participants" ON escrow_payments FOR UPDATE
USING (
  auth.uid() = client_id OR
  auth.uid() = provider_id OR
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND state = 'approved'
  )
)
WITH CHECK (
  auth.uid() = client_id OR
  auth.uid() = provider_id OR
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND state = 'approved'
  )
);

-- Rewards: Owner only
CREATE POLICY "Client rewards viewable by owner" ON client_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Client rewards updatable by owner" ON client_rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client rewards insertable by owner" ON client_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reward transactions viewable by owner" ON reward_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Reward marketplace viewable by all" ON reward_marketplace FOR SELECT USING (true);

-- Referrals: Referrer can view their referrals
CREATE POLICY "Referrals viewable by referrer" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Referrals insertable" ON referrals FOR INSERT WITH CHECK (true);

-- Saved Searches: Owner only
CREATE POLICY "Saved searches by owner" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Reports: Reporter and admins
CREATE POLICY "Reports viewable by reporter and admins" ON reports FOR SELECT USING (
  auth.uid() = reporter_id OR
  EXISTS (
    SELECT 1
    FROM user_role_memberships
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND state = 'approved'
  )
);
CREATE POLICY "Reports insertable by anyone" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ============================================================================
-- STORAGE BUCKETS (to be created via Supabase Dashboard or API)
-- ============================================================================
-- Bucket: job-photos (public read, client insert)
-- Bucket: provider-documents (private, provider only)
-- Bucket: provider-portfolios (public read, provider insert)
-- Bucket: avatars (public read, owner insert)

-- ============================================================================
-- REALTIME SUBSCRIPTIONS (to be configured)
-- ============================================================================
-- Enable realtime for: messages, notifications, bookings, quotes (status updates)
