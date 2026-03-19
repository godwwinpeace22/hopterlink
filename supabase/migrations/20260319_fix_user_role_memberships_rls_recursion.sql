-- Fix recursive policy on user_role_memberships.
-- The prior policy queried user_role_memberships inside its own USING clause,
-- which triggers: "infinite recursion detected in policy for relation user_role_memberships".

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
