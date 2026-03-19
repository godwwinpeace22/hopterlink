-- Admin backoffice read/update access for moderation and analytics screens.

-- Bookings read access for admins
DROP POLICY IF EXISTS "bookings_select_admin" ON public.bookings;
CREATE POLICY "bookings_select_admin" ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_role_memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.state = 'approved'
  )
);

-- Quotes read access for admins
DROP POLICY IF EXISTS "quotes_select_admin" ON public.quotes;
CREATE POLICY "quotes_select_admin" ON public.quotes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_role_memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.state = 'approved'
  )
);

-- Escrow payments read access for admins
DROP POLICY IF EXISTS "escrow_select_admin" ON public.escrow_payments;
CREATE POLICY "escrow_select_admin" ON public.escrow_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_role_memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.state = 'approved'
  )
);

-- Profiles update access for admins (suspend/unsuspend moderation action)
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_role_memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.state = 'approved'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_role_memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.state = 'approved'
  )
);
