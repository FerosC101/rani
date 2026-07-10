-- ── Users ──────────────────────────────────────────────────────────
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  stellar_public_key text unique,
  created_at timestamptz default now()
);

-- ── Contacts ───────────────────────────────────────────────────────
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  address text not null,
  tag text,
  created_at timestamptz default now(),
  unique (user_id, address) -- stop the same address being saved twice
);

create index idx_contacts_user_id on contacts(user_id);

-- ── Transactions ───────────────────────────────────────────────────
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null, -- keep history even if contact is deleted
  amount numeric(20, 7) not null,       -- Stellar supports up to 7 decimal places; numeric is exact, unlike float
  asset_code text not null,
  asset_issuer text,
  memo text,
  status text not null default 'PENDING'
    check (status in ('PENDING','BUILDING','AWAITING_SIGNATURE','SUBMITTING','POLLING','SUCCESS','FAILED')),
  stellar_tx_hash text,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_contact_id on transactions(contact_id);

-- auto-update `updated_at` on every UPDATE (Postgres doesn't do this for free)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_transactions_updated_at
before update on transactions
for each row execute function set_updated_at();

-- ── Spending limits ────────────────────────────────────────────────
create table spending_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  per_tx_limit numeric(20, 7) default 5000,
  daily_limit numeric(20, 7) default 20000
);

-- ── Audit log ──────────────────────────────────────────────────────
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  action text not null,
  payload jsonb, -- jsonb instead of text: lets you actually query logged data later
  created_at timestamptz default now()
);

create index idx_audit_log_user_id on audit_log(user_id);

-- ── Row Level Security ─────────────────────────────────────────────

alter table users enable row level security;
alter table contacts enable row level security;
alter table transactions enable row level security;
alter table spending_limits enable row level security;
alter table audit_log enable row level security;
