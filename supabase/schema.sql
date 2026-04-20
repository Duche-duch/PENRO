-- Run in Supabase SQL Editor (Project → SQL → New query).
-- Records management: users, leave records, audit trail.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (application accounts; passwords hashed with bcrypt on the API)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('employee', 'hr', 'admin', 'chief', 'penr')),
  department text default '',
  position text default '',
  vacation_credits numeric(12, 4) default 15,
  sick_credits numeric(12, 4) default 15,
  active boolean not null default true,
  date_hired date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (lower(email));
create index if not exists users_role_idx on public.users (role);

-- ---------------------------------------------------------------------------
-- Leave / records (full application JSON for the existing UI)
-- ---------------------------------------------------------------------------
create table if not exists public.records (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists records_updated_at_idx on public.records (updated_at desc);
create index if not exists records_payload_gin on public.records using gin (payload jsonb_path_ops);

-- ---------------------------------------------------------------------------
-- Audit log (optional reporting & compliance)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  entity_id text,
  user_id text references public.users (id) on delete set null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Maintain updated_at on users & records
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists records_set_updated_at on public.records;
create trigger records_set_updated_at
  before update on public.records
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed demo users (passwords match demo quick-login in the app)
-- ---------------------------------------------------------------------------
insert into public.users (id, email, password_hash, name, role, department, position, vacation_credits, sick_credits, active, date_hired)
values
  (
    'EMP-1001',
    'juan.delacruz@denr.gov.ph',
    '$2b$10$6WyndxoouQ7RblK97B3OHOtdLZacx5BB2iwkQw55.qJh.gTccjVoW',
    'Juan Dela Cruz',
    'employee',
    'Human Resources',
    'HR Officer II',
    15.245,
    12.58,
    true,
    '2020-01-15'
  ),
  (
    'EMP-1002',
    'maria.santos@denr.gov.ph',
    '$2b$10$6WyndxoouQ7RblK97B3OHOtdLZacx5BB2iwkQw55.qJh.gTccjVoW',
    'Maria Santos',
    'employee',
    'Finance',
    'Accountant III',
    12.5,
    15,
    true,
    '2019-03-20'
  ),
  (
    'HR-001',
    'hr@denr.gov.ph',
    '$2b$10$vSPS9SDiMsOM.OiENug72.1gBGzUBHwee9OLSiTrnSZPA8q4JI73q',
    'Gardeniah Krizyl B. Lastima',
    'hr',
    'Human Resources',
    'HR Officer IV/HRMO',
    null,
    null,
    true,
    '2015-06-01'
  ),
  (
    'ADMIN-001',
    'admin@denr.gov.ph',
    '$2b$10$ptDqqucxRqhGsnAOBnQsyOVXKKyLhft6bvY4qq9HDD13VOv3Ypw/e',
    'System Administrator',
    'admin',
    'Information Technology',
    'System Admin',
    null,
    null,
    true,
    '2018-01-10'
  ),
  (
    'CSD-001',
    'chief@denr.gov.ph',
    '$2b$10$RDpLUFOoxy3p/PtTVejnAuqkTuQToGpQ79G03OwIpQkkSCfU3rlAW',
    'Julius James M. Vela',
    'chief',
    'Management Services Division',
    'Chief, Mgt. Services Division',
    null,
    null,
    true,
    '2012-08-15'
  ),
  (
    'PENR-001',
    'penr@denr.gov.ph',
    '$2b$10$DQmuNRLwN7r1B5za8P6sOuuA3tibQL0ZJP8Yy9FjiIigpbThJo9va',
    'George E. Laolao',
    'penr',
    'Executive Office',
    'PENR Officer',
    null,
    null,
    true,
    '2010-04-20'
  )
on conflict (id) do nothing;

-- Optional: seed two sample leave records matching the old demo UI
insert into public.records (id, payload, created_at, updated_at)
values
  (
    'LA-2026-001',
    '{
      "id": "LA-2026-001",
      "employeeId": "EMP-1001",
      "employeeName": "Juan Dela Cruz",
      "department": "Human Resources",
      "position": "HR Officer II",
      "salary": "25,000",
      "leaveType": "Vacation Leave",
      "leaveDetails": "Within the Philippines",
      "startDate": "2026-01-20",
      "endDate": "2026-01-24",
      "days": 5,
      "reason": "Family vacation",
      "status": "pending",
      "workflowStatus": "pending_hr",
      "appliedDate": "2026-01-10",
      "vacationCredits": 15.245,
      "sickCredits": 12.58,
      "earnedCredits": 27.825,
      "commutation": "Not Requested",
      "employeeSignature": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Signature_of_H._P._Lovecraft.png",
      "hrSignature": null,
      "hrRecommendation": null,
      "hrRecommendationDate": null,
      "chiefSignature": null,
      "chiefRecommendation": null,
      "chiefRecommendationDate": null,
      "penrSignature": null,
      "penrApproval": null,
      "penrApprovalDate": null,
      "penrDisapprovalReason": null
    }'::jsonb,
    now(),
    now()
  ),
  (
    'LA-2026-002',
    '{
      "id": "LA-2026-002",
      "employeeId": "EMP-1002",
      "employeeName": "Maria Santos",
      "department": "Finance",
      "position": "Accountant III",
      "salary": "28,000",
      "leaveType": "Sick Leave",
      "leaveDetails": "In Hospital",
      "startDate": "2026-02-01",
      "endDate": "2026-02-03",
      "days": 3,
      "reason": "Medical treatment",
      "status": "approved",
      "workflowStatus": "approved",
      "appliedDate": "2026-01-25",
      "vacationCredits": 12.5,
      "sickCredits": 15,
      "earnedCredits": 27.5,
      "commutation": "Not Requested",
      "employeeSignature": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Signature_of_H._P._Lovecraft.png",
      "hrSignature": "https://upload.wikimedia.org/wikipedia/commons/6/66/John_Hancock_signature.png",
      "hrRecommendation": "Approved",
      "hrRecommendationDate": "2026-01-26",
      "chiefSignature": "https://upload.wikimedia.org/wikipedia/commons/6/66/John_Hancock_signature.png",
      "chiefRecommendation": "Approved",
      "chiefRecommendationDate": "2026-01-27",
      "penrSignature": "https://upload.wikimedia.org/wikipedia/commons/6/66/John_Hancock_signature.png",
      "penrApproval": "Approved",
      "penrApprovalDate": "2026-01-28",
      "penrDisapprovalReason": null
    }'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;
