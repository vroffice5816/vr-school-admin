-- Emergency Sheet Portal, migration 2. Run AFTER 20261124000000_init.sql.
-- Safe to run more than once. Does not change any student data.
--
-- What it does:
--   1. Adds an 'admin' role to staff_division_access (admins see every active student).
--   2. Replaces emergency_sheets_view with get_emergency_sheet(), a function that returns
--      ONLY the columns the sheet needs, for ONLY the caller's grades.
--   3. Removes all direct table access for app users. Before this, any signed-in staff
--      member could query public.student directly and read every column
--      (address, OEN, birth date, ...) for their grades.

-- 1. Roles --------------------------------------------------------------------------
alter table public.staff_division_access
  add column if not exists role text not null default 'staff';

alter table public.staff_division_access
  drop constraint if exists staff_division_access_role_check;
alter table public.staff_division_access
  add constraint staff_division_access_role_check check (role in ('staff', 'admin'));

-- Admins don't need a grade list; staff still need at least one grade.
alter table public.staff_division_access
  drop constraint if exists staff_division_access_allowed_grades_check;
alter table public.staff_division_access
  drop constraint if exists staff_division_access_grades_check;
alter table public.staff_division_access
  alter column allowed_grades set default '{}';
alter table public.staff_division_access
  add constraint staff_division_access_grades_check
  check (role = 'admin' or cardinality(allowed_grades) > 0);

insert into public.staff_division_access (email, division_name, allowed_grades, role) values
  ('office@vedicroots.ca', 'All Students', '{}', 'admin')
on conflict (email) do update set role = 'admin', division_name = excluded.division_name;

-- Keep RLS on student as a second line of defence (admins included).
drop policy if exists "Staff read assigned division grades" on public.student;
create policy "Staff read assigned division grades"
  on public.student for select to authenticated
  using (
    exists (
      select 1
      from public.staff_division_access sda
      where sda.email = (select lower(auth.jwt() ->> 'email'))
        and (sda.role = 'admin' or student.grade = any (sda.allowed_grades))
    )
  );

-- 2. The only way the app reads students --------------------------------------------
drop view if exists public.emergency_sheets_view;

drop function if exists public.get_emergency_sheet();
create function public.get_emergency_sheet()
returns table (
  id              text,
  full_legal_name text,
  age             text,
  grade           text,
  location        text,
  room            text,
  parent_1_name   text,
  parent_1_phone  text,
  parent_1_email  text,
  parent_2_name   text,
  parent_2_phone  text,
  parent_2_email  text,
  media_release   text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id::text,
    nullif(concat_ws(' ', nullif(trim(s.first_name), ''), nullif(trim(s.middle_name), ''), nullif(trim(s.last_name), '')), ''),
    case when s.date_of_birth is null then null
         else extract(year  from age(s.date_of_birth))::int || 'Y, ' ||
              extract(month from age(s.date_of_birth))::int || 'M'
    end,
    s.grade::text,
    s.location::text,
    s.room::text,
    s.parent_1_name::text,
    s.parent_1_phone::text,
    s.parent_1_email::text,
    s.parent_2_name::text,
    s.parent_2_phone::text,
    s.parent_2_email::text,
    s.media_release::text
  from public.student s
  join public.staff_division_access sda
    on sda.email = lower(auth.jwt() ->> 'email')
  where (sda.role = 'admin' or s.grade = any (sda.allowed_grades))
    -- Hide students whose end date has passed (future start dates still show: safer in an emergency).
    and (s.end_date is null or s.end_date >= current_date)
  order by s.room, s.last_name, s.first_name;
$$;

-- 3. Least privilege ----------------------------------------------------------------
revoke all on function public.get_emergency_sheet() from public, anon;
grant execute on function public.get_emergency_sheet() to authenticated;

-- No direct reads of the student table from the app (the function above runs as its owner).
revoke all on public.student from anon, authenticated;

-- Staff may read their own access row and nothing else (RLS policy from init migration).
revoke all on public.staff_division_access from anon, authenticated;
grant select on public.staff_division_access to authenticated;
