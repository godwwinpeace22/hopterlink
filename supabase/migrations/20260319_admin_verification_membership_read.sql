-- Allow admins to read provider onboarding membership states for backoffice verification.

DROP POLICY IF EXISTS "role_memberships_select_admin" ON public.user_role_memberships;
CREATE POLICY "role_memberships_select_admin" ON public.user_role_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
