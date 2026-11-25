# Staff Emergency Sheet Portal

Next.js 15 (App Router) + Supabase Auth/Postgres, deployable on Vercel.
Each staff login sees only the grades assigned to it, and the admin login sees every active student.
The database enforces this, not the browser.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev
```

With no Supabase keys, the app runs in **Demo Mode** with fake students (development only).
Demo Mode includes one account per division plus an admin account.

## Connect Supabase (one time)

1. Create a Supabase project (for Canadian student data, pick the `ca-central-1` region).
2. **SQL Editor**: run the files in `supabase/migrations/` **in order**:
   - `20261124000000_init.sql`: the `staff_division_access` table, RLS, and the division logins.
   - `20261125000000_admin_access_and_sheet_function.sql`: the admin role (`office@vedicroots.ca`),
     the `get_emergency_sheet()` function the app reads from, and least-privilege grants
     (app users can no longer query the `student` table directly).
3. **Authentication → Users → Add user** for each staff email and for `office@vedicroots.ca`.
   Then turn off **"Allow new users to sign up"** under Authentication settings, and consider enabling MFA.
4. **Project Settings → API**: copy the Project URL and anon/publishable key into `.env.local`.

### Access rules

| `role`  | Sees                                   | `allowed_grades`            |
|---------|----------------------------------------|-----------------------------|
| `staff` | Only students in `allowed_grades`      | e.g. `{JK,SK}` (required)   |
| `admin` | Every active student                   | `{}` (ignored)              |

Add or change a login in the `staff_division_access` table. No code change needed.
Grade values must match the `student.grade` column exactly (`JK`, `SK`, `Grade 1` … `Grade 8`).

Student rows are edited in the Supabase dashboard; the portal is read-only by design.
`get_emergency_sheet()` builds the full name from first/middle/last name, computes age from
`date_of_birth`, and hides students whose `end_date` has passed. Change that function if your table changes.

## Branding

The logo is `public/vr-logo-black.png` (set in `lib/config.ts` → `LOGO_SRC`). It is used in the
header, the login page, the printed sheet, and as the browser tab icon. To change it, replace the
file or point `LOGO_SRC` at a new file in `public/` (paths start with `/`, without `public`).

## Printing

**Print sheet** prints a compact sheet (portrait by default; choose Landscape in the print dialog if you prefer): one line per student, both parents with phone
numbers, media release, and a heading per classroom. About 45 students fit on a page, so a class
prints on one page and a division on one or two. Filter first (e.g. one classroom) to print less.
Parent emails are only in the **CSV** download.

## Deploy (GitHub → Vercel)

1. Push this repo to GitHub (`.env*` files are git-ignored).
2. Vercel → **Add New Project** → import the repo (framework is auto-detected).
3. Add env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or use the Supabase ↔ Vercel integration, which sets them).
4. Deploy. Never add the `service_role` key anywhere in this project.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and build on every push and PR.

## Safety notes

- **Demo data is blocked in production.** If Supabase env vars are missing on Vercel, the app shows a "not configured" screen instead of fake students. Override only with `ALLOW_DEMO_MODE=true`.
- If student data fails to load, the app shows an error, never an empty sheet that looks like "no students".
- CSV export neutralises spreadsheet formula injection; pages are `noindex` and `no-store`, with a strict Content-Security-Policy.
- Supabase free projects pause after inactivity. Use a paid plan for a tool people rely on in emergencies.

## Scripts

`npm run dev` · `build` · `start` · `lint` · `typecheck` · `test`
