CREATE OR REPLACE FUNCTION public.parse_booking_time_text(
  p_value TEXT,
  p_allow_display_time BOOLEAN DEFAULT true
)
RETURNS TIME AS $$
DECLARE
  v_value TEXT := NULLIF(TRIM(COALESCE(p_value, '')), '');
  v_match TEXT[];
  v_hour INTEGER;
  v_minute INTEGER;
  v_meridiem TEXT;
BEGIN
  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_value ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
    RETURN v_value::time;
  END IF;

  IF p_allow_display_time THEN
    v_match := regexp_match(v_value, '^(0?[1-9]|1[0-2]):([0-5][0-9])\s*([AaPp][Mm])$');
    IF v_match IS NOT NULL THEN
      v_hour := v_match[1]::integer;
      v_minute := v_match[2]::integer;
      v_meridiem := upper(v_match[3]);

      IF v_meridiem = 'PM' AND v_hour < 12 THEN
        v_hour := v_hour + 12;
      ELSIF v_meridiem = 'AM' AND v_hour = 12 THEN
        v_hour := 0;
      END IF;

      RETURN make_time(v_hour, v_minute, 0);
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.normalize_provider_schedule_day(
  p_value JSONB,
  p_use_legacy_default BOOLEAN DEFAULT true
)
RETURNS JSONB AS $$
DECLARE
  v_mode TEXT;
  v_ranges JSONB := '[]'::jsonb;
  v_range JSONB;
  v_range_start TEXT;
  v_range_end TEXT;
  v_slots_key TEXT;
  v_slot_keys TEXT[] := ARRAY[]::TEXT[];
  v_prev_minutes INTEGER;
  v_current_start TEXT;
  v_current_minutes INTEGER;
BEGIN
  IF p_value IS NULL OR p_value = 'null'::jsonb OR p_value = 'false'::jsonb THEN
    RETURN jsonb_build_object('mode', 'unavailable', 'ranges', '[]'::jsonb);
  END IF;

  IF p_value = 'true'::jsonb THEN
    IF p_use_legacy_default THEN
      RETURN jsonb_build_object(
        'mode', 'custom',
        'ranges', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '17:00'))
      );
    END IF;

    RETURN jsonb_build_object(
      'mode', 'all_day',
      'ranges', jsonb_build_array(jsonb_build_object('start', '00:00', 'end', '24:00'))
    );
  END IF;

  IF jsonb_typeof(p_value) = 'array' THEN
    FOR v_range IN SELECT value FROM jsonb_array_elements(p_value)
    LOOP
      v_range_start := NULLIF(TRIM(COALESCE(v_range ->> 'start', '')), '');
      v_range_end := NULLIF(TRIM(COALESCE(v_range ->> 'end', '')), '');
      IF v_range_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        AND v_range_end ~ '^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$'
         AND public.parse_booking_time_text(v_range_start, false) IS NOT NULL
         AND (v_range_end = '24:00' OR public.parse_booking_time_text(v_range_end, false) IS NOT NULL)
         AND (
           CASE
             WHEN v_range_end = '24:00' THEN 1440
             ELSE EXTRACT(EPOCH FROM public.parse_booking_time_text(v_range_end, false))::integer / 60
           END
         ) > EXTRACT(EPOCH FROM public.parse_booking_time_text(v_range_start, false))::integer / 60
      THEN
        v_ranges := v_ranges || jsonb_build_array(
          jsonb_build_object('start', v_range_start, 'end', v_range_end)
        );
      END IF;
    END LOOP;

    IF jsonb_array_length(v_ranges) = 0 THEN
      RETURN jsonb_build_object('mode', 'unavailable', 'ranges', '[]'::jsonb);
    END IF;

    IF jsonb_array_length(v_ranges) = 1
       AND v_ranges -> 0 ->> 'start' = '00:00'
       AND v_ranges -> 0 ->> 'end' = '24:00' THEN
      RETURN jsonb_build_object('mode', 'all_day', 'ranges', v_ranges);
    END IF;

    RETURN jsonb_build_object('mode', 'custom', 'ranges', v_ranges);
  END IF;

  IF jsonb_typeof(p_value) <> 'object' THEN
    RETURN jsonb_build_object(
      'mode', 'all_day',
      'ranges', jsonb_build_array(jsonb_build_object('start', '00:00', 'end', '24:00'))
    );
  END IF;

  IF p_value ? 'mode' THEN
    v_mode := lower(COALESCE(p_value ->> 'mode', ''));
    IF v_mode = 'unavailable' THEN
      RETURN jsonb_build_object('mode', 'unavailable', 'ranges', '[]'::jsonb);
    END IF;

    IF v_mode = 'all_day' THEN
      RETURN jsonb_build_object(
        'mode', 'all_day',
        'ranges', jsonb_build_array(jsonb_build_object('start', '00:00', 'end', '24:00'))
      );
    END IF;

    IF v_mode = 'custom' THEN
      RETURN public.normalize_provider_schedule_day(COALESCE(p_value -> 'ranges', '[]'::jsonb), true);
    END IF;

    RETURN jsonb_build_object(
      'mode', 'all_day',
      'ranges', jsonb_build_array(jsonb_build_object('start', '00:00', 'end', '24:00'))
    );
  END IF;

  IF (p_value ? 'start') AND (p_value ? 'end') THEN
    IF COALESCE((p_value ->> 'available')::boolean, true) = false THEN
      RETURN jsonb_build_object('mode', 'unavailable', 'ranges', '[]'::jsonb);
    END IF;

    RETURN public.normalize_provider_schedule_day(jsonb_build_array(p_value), true);
  END IF;

  IF p_value ? 'slots' AND jsonb_typeof(p_value -> 'slots') = 'object' THEN
    p_value := p_value -> 'slots';
  END IF;

  FOR v_slots_key IN
    SELECT key
    FROM jsonb_each(p_value)
    WHERE value = 'true'::jsonb
      AND key ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    ORDER BY key
  LOOP
    v_slot_keys := array_append(v_slot_keys, v_slots_key);
  END LOOP;

  IF array_length(v_slot_keys, 1) IS NULL THEN
    RETURN jsonb_build_object('mode', 'unavailable', 'ranges', '[]'::jsonb);
  END IF;

  FOREACH v_slots_key IN ARRAY v_slot_keys
  LOOP
    v_current_minutes := EXTRACT(EPOCH FROM public.parse_booking_time_text(v_slots_key, false))::integer / 60;
    IF v_current_start IS NULL THEN
      v_current_start := v_slots_key;
      v_prev_minutes := v_current_minutes;
      CONTINUE;
    END IF;

    IF v_current_minutes - v_prev_minutes NOT IN (30, 60) THEN
      v_ranges := v_ranges || jsonb_build_array(
        jsonb_build_object(
          'start', v_current_start,
          'end', to_char(make_time(v_prev_minutes / 60, v_prev_minutes % 60, 0) + interval '1 hour', 'HH24:MI')
        )
      );
      v_current_start := v_slots_key;
    END IF;

    v_prev_minutes := v_current_minutes;
  END LOOP;

  v_ranges := v_ranges || jsonb_build_array(
    jsonb_build_object(
      'start', v_current_start,
      'end', to_char(make_time(v_prev_minutes / 60, v_prev_minutes % 60, 0) + interval '1 hour', 'HH24:MI')
    )
  );

  RETURN jsonb_build_object('mode', 'custom', 'ranges', v_ranges);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.resolve_provider_schedule_day(
  p_availability JSONB,
  p_local_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_date_key TEXT := to_char(p_local_date, 'YYYY-MM-DD');
  v_weekday TEXT := lower(trim(to_char(p_local_date, 'Day')));
  v_root JSONB := COALESCE(p_availability, '{}'::jsonb);
  v_dates JSONB;
  v_weekly JSONB;
BEGIN
  IF jsonb_typeof(v_root) <> 'object' THEN
    RETURN jsonb_build_object(
      'mode', 'all_day',
      'ranges', jsonb_build_array(jsonb_build_object('start', '00:00', 'end', '24:00'))
    );
  END IF;

  v_dates := CASE
    WHEN jsonb_typeof(v_root -> 'dates') = 'object' THEN v_root -> 'dates'
    ELSE v_root
  END;

  IF jsonb_typeof(v_dates) = 'object' AND v_dates ? v_date_key THEN
    RETURN public.normalize_provider_schedule_day(v_dates -> v_date_key, true);
  END IF;

  v_weekly := CASE
    WHEN jsonb_typeof(v_root -> 'weekly') = 'object' THEN v_root -> 'weekly'
    ELSE NULL
  END;

  IF jsonb_typeof(v_weekly) = 'object' AND v_weekly ? v_weekday THEN
    RETURN public.normalize_provider_schedule_day(v_weekly -> v_weekday, false);
  END IF;

  RETURN jsonb_build_object(
    'mode', 'all_day',
    'ranges', jsonb_build_array(jsonb_build_object('start', '00:00', 'end', '24:00'))
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.provider_schedule_allows_interval(
  p_day JSONB,
  p_start TIME,
  p_end TIME,
  p_crosses_day BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  v_range JSONB;
  v_start_minutes INTEGER := EXTRACT(EPOCH FROM p_start)::integer / 60;
  v_end_minutes INTEGER := EXTRACT(EPOCH FROM p_end)::integer / 60;
  v_range_start INTEGER;
  v_range_end INTEGER;
BEGIN
  IF p_start IS NULL OR p_end IS NULL OR p_crosses_day THEN
    RETURN false;
  END IF;

  IF jsonb_typeof(p_day) <> 'object' THEN
    RETURN true;
  END IF;

  IF lower(COALESCE(p_day ->> 'mode', 'all_day')) = 'unavailable' THEN
    RETURN false;
  END IF;

  FOR v_range IN SELECT value FROM jsonb_array_elements(COALESCE(p_day -> 'ranges', '[]'::jsonb))
  LOOP
    v_range_start := EXTRACT(EPOCH FROM public.parse_booking_time_text(v_range ->> 'start', false))::integer / 60;
    v_range_end := CASE
      WHEN v_range ->> 'end' = '24:00' THEN 1440
      ELSE EXTRACT(EPOCH FROM public.parse_booking_time_text(v_range ->> 'end', false))::integer / 60
    END;

    IF v_start_minutes >= v_range_start AND v_end_minutes <= v_range_end THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
  v_availability JSONB;
  v_timezone TEXT;
  v_local_date DATE;
  v_local_start_time TIME;
  v_local_start TIMESTAMP;
  v_local_end TIMESTAMP;
  v_start_utc TIMESTAMPTZ;
  v_schedule_day JSONB;
  v_conflict_exists BOOLEAN := false;
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

  IF p_scheduled_date IS NULL OR LEFT(TRIM(p_scheduled_date), 10) !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'Scheduled date must be in YYYY-MM-DD format';
  END IF;

  v_local_start_time := public.parse_booking_time_text(p_scheduled_time, false);
  IF v_local_start_time IS NULL THEN
    RAISE EXCEPTION 'Scheduled time must be in HH:MM 24-hour format';
  END IF;

  SELECT hourly_rate, service_minimum_hours, availability,
         COALESCE(NULLIF(TRIM(availability ->> 'timezone'), ''), 'Africa/Lagos')
  INTO v_hourly_rate, v_service_minimums, v_availability, v_timezone
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

  v_local_date := LEFT(TRIM(p_scheduled_date), 10)::date;
  v_local_start := v_local_date::timestamp + v_local_start_time;
  v_local_end := v_local_start + make_interval(secs => ROUND(v_requested_hours * 3600)::integer);

  IF v_local_end::date <> v_local_date THEN
    RAISE EXCEPTION 'Bookings must start and finish on the same day';
  END IF;

  v_schedule_day := public.resolve_provider_schedule_day(v_availability, v_local_date);
  IF NOT public.provider_schedule_allows_interval(
    v_schedule_day,
    v_local_start_time,
    v_local_end::time,
    false
  ) THEN
    RAISE EXCEPTION 'Requested time falls outside the provider''s available hours';
  END IF;

  v_start_utc := v_local_start AT TIME ZONE v_timezone;

  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.provider_id = p_provider_id
      AND b.status IN ('pending', 'confirmed', 'in_progress')
      AND v_start_utc < (
        CASE
          WHEN public.parse_booking_time_text(b.scheduled_time, true) IS NOT NULL THEN
            (((b.scheduled_date AT TIME ZONE v_timezone)::date)::timestamp + public.parse_booking_time_text(b.scheduled_time, true)) AT TIME ZONE v_timezone
            + make_interval(secs => ROUND(COALESCE(b.requested_hours, b.duration_hours, 0) * 3600)::integer)
          ELSE
            b.scheduled_date
            + make_interval(secs => ROUND(COALESCE(b.requested_hours, b.duration_hours, 0) * 3600)::integer)
        END
      )
      AND (v_start_utc + make_interval(secs => ROUND(v_requested_hours * 3600)::integer)) > (
        CASE
          WHEN public.parse_booking_time_text(b.scheduled_time, true) IS NOT NULL THEN
            (((b.scheduled_date AT TIME ZONE v_timezone)::date)::timestamp + public.parse_booking_time_text(b.scheduled_time, true)) AT TIME ZONE v_timezone
          ELSE
            b.scheduled_date
        END
      )
  ) INTO v_conflict_exists;

  IF v_conflict_exists THEN
    RAISE EXCEPTION 'Provider already has an overlapping booking for that time';
  END IF;

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
    v_start_utc, to_char(v_local_start_time, 'HH24:MI'), v_requested_hours,
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