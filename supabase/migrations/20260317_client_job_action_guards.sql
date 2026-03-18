-- Server-side guardrails for client job actions.
-- These functions prevent unsafe deletes/closes even if a client bypasses UI checks.

create or replace function public.client_delete_job_safe(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job jobs%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_job
  from jobs
  where id = p_job_id
    and client_id = auth.uid()
  for update;

  if not found then
    raise exception 'Job not found or not owned by client.';
  end if;

  if exists (select 1 from quotes where job_id = p_job_id) then
    raise exception 'Cannot delete a job that already has quotes.';
  end if;

  if exists (select 1 from bookings where job_id = p_job_id) then
    raise exception 'Cannot delete a job that already has bookings.';
  end if;

  delete from jobs where id = p_job_id and client_id = auth.uid();

  return true;
end;
$$;

grant execute on function public.client_delete_job_safe(uuid) to authenticated;

create or replace function public.client_close_job_safe(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job jobs%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_job
  from jobs
  where id = p_job_id
    and client_id = auth.uid()
  for update;

  if not found then
    raise exception 'Job not found or not owned by client.';
  end if;

  if exists (
    select 1
    from bookings
    where job_id = p_job_id
      and status in ('in_progress', 'completed')
  ) then
    raise exception 'Cannot close a job with work already started.';
  end if;

  update jobs
  set status = 'cancelled'
  where id = p_job_id
    and client_id = auth.uid();

  update bookings
  set status = 'cancelled'
  where job_id = p_job_id
    and status in ('pending', 'confirmed');

  return true;
end;
$$;

grant execute on function public.client_close_job_safe(uuid) to authenticated;
