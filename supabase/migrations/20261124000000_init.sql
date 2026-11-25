-- Staff Emergency Sheet Portal: access control + read-only view over your EXISTING public.student table.
-- Run in Supabase Dashboard -> SQL Editor. Safe to run more than once.
-- This script does NOT create or alter the student table's columns or data.

-- 0. Clean up anything from the earlier draft of this migration (no-ops if absent)
drop trigger  if exists student_set_updated_at on public.student;
drop function if exists public.set_updated_at();

-- 1. Which staff login can see which grades
create table if not exists public.staff_division_access (
  email          text primary key check (email = lower(email)),
  division_name  text not null,
  allowed_grades text[] not null check (cardinality(allowed_grades) > 0)
);

insert into public.staff_division_access (email, division_name, allowed_grades) values
  ('kg@vedicroots.ca',               'Kindergarten',     array['JK', 'SK']),
  ('lower.elementary@vedicroots.ca', 'Lower Elementary', array['1', '2', '3']),
  ('upper.elementary@vedicroots.ca', 'Upper Elementary', array['4', '5', '6']),
  ('middle.school@vedicroots.ca',    'Middle School',    array['7', '8'])
on conflict (email) do nothing;

create index if not exists student_grade_idx on public.student (grade);

-- 2. Row Level Security: staff are read-only and only see their own grades
alter table public.staff_division_access enable row level security;
alter table public.student               enable row level security;

drop policy if exists "Staff read own access row" on public.staff_division_access;
create policy "Staff read own access row"
  on public.staff_division_access for select to authenticated
  using (email = (select lower(auth.jwt() ->> 'email')));

drop policy if exists "Staff read assigned division grades" on public.student;
create policy "Staff read assigned division grades"
  on public.student for select to authenticated
  using (
    exists (
      select 1
      from public.staff_division_access sda
      where sda.email = (select lower(auth.jwt() ->> 'email'))
        and student.grade = any (sda.allowed_grades)
    )
  );

-- 3. The view the app reads. It exposes ONLY what the emergency sheet needs
--    (no OEN, address, gender, emails, birth date or media release).
--    security_invoker makes RLS apply to whoever is logged in.
create or replace view public.emergency_sheets_view
with (security_invoker = true) as
select
  s.id,
  concat_ws(' ', nullif(trim(s.first_name), ''), nullif(trim(s.middle_name), ''), nullif(trim(s.last_name), '')) as full_legal_name,
  case when s.date_of_birth is null then null
       else extract(year  from age(s.date_of_birth))::int || 'Y, ' ||
            extract(month from age(s.date_of_birth))::int || 'M'
  end as age,
  s.location,
  s.room,
  s.grade,
  s.parent_1_name,
  s.parent_1_phone,
  s.parent_2_name,
  s.parent_2_phone,
  s.life_threatening_allergy,
  s."non-life_threatening_allergy" as non_life_threatening_allergy,
  s.medical_conditions,
  s.dietary_restrictions
from public.student s
-- Hide students whose end date has passed. (Future start dates are still shown: safer on an emergency sheet.)
where s.end_date is null or s.end_date >= current_date;

-- 4. Least privilege
revoke all on public.student, public.staff_division_access, public.emergency_sheets_view from anon;
grant select on public.student, public.staff_division_access, public.emergency_sheets_view to authenticated;
