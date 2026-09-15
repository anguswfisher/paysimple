-- ============================================================
-- PaySimple: Pay Applications Migration
-- Ported from Angular TurboTax-style pay app wizard
-- ============================================================

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

create type pay_app_status as enum ('draft', 'finalized', 'corrected-draft');
create type entry_mode as enum ('guided', 'from-previous', 'blank');
create type billing_format as enum ('schedule-of-values', 'total-only');
create type retainage_applies_to as enum ('work', 'materials', 'both');
create type change_order_mode as enum ('none', 'totals-only', 'individual');


-- ─────────────────────────────────────────
-- pay_applications
-- Core record. One row per pay app (draft or finalized).
-- ─────────────────────────────────────────

create table pay_applications (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,

  -- Status & mode
  status                pay_app_status not null default 'draft',
  entry_mode            entry_mode not null default 'guided',

  -- Basics (payment summary header fields)
  project_name          text not null default '',
  owner_name            text not null default '',
  contractor_name       text not null default '',
  application_number    text not null default '',
  period_start_date     date,
  period_end_date       date,
  payment_due_date      date,

  -- Setup
  billing_format        billing_format not null default 'schedule-of-values',
  materials_stored_enabled boolean not null default false,

  -- Retainage settings (flattened from RetainageSettings interface)
  retainage_percent           numeric(5,2) not null default 10.00,
  retainage_applies_to        retainage_applies_to not null default 'both',
  retainage_can_change        boolean not null default false,
  retainage_effective_date    date,
  retainage_new_percent       numeric(5,2),

  -- Change order settings (flattened from ChangeOrderSettings interface)
  change_orders_enabled       boolean not null default false,
  change_order_mode           change_order_mode not null default 'none',
  change_order_total_amount   numeric(14,2),

  -- Wizard progress (for resuming)
  current_step          integer not null default 1,
  completed_steps       integer[] not null default '{}',

  -- Signature (flattened from SignatureInfo interface)
  signer_name           text,
  signer_title          text,
  signature_date        date,
  signature_notes       text,

  -- Corrected draft tracking
  corrected_from_id     uuid references pay_applications(id) on delete set null,
  correction_reason     text,
  correction_notes      text,

  -- Finalized snapshot: payment summary totals frozen at finalization
  -- Stored as JSONB so the historical record is immutable even if
  -- line items are later changed on a corrected draft.
  finalized_snapshot    jsonb,

  -- Timestamps
  finalized_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table pay_applications is
  'construction pay application pay applications — one row per application, any status.';

comment on column pay_applications.finalized_snapshot is
  'Immutable JSON snapshot of payment summary totals + line items taken at finalization. '
  'Shape: { payAppTotals: PayAppTotals, lineItems: LineItem[], signatureInfo: SignatureInfo, finalizedAt: string }';

comment on column pay_applications.completed_steps is
  'Array of wizard step numbers (1–12) the user has completed. Used to resume mid-wizard.';


-- ─────────────────────────────────────────
-- pay_application_line_items
-- Schedule of Values rows.
-- ─────────────────────────────────────────

create table pay_application_line_items (
  id                          uuid primary key default gen_random_uuid(),
  pay_application_id          uuid not null references pay_applications(id) on delete cascade,

  -- Display order
  sort_order                  integer not null default 0,
  line_number                 text not null default '',
  description                 text not null default '',

  -- Input values (user-entered)
  scheduled_value             numeric(14,2) not null default 0,
  previous_work               numeric(14,2) not null default 0,
  this_period_work            numeric(14,2) not null default 0,
  previous_materials_stored   numeric(14,2) not null default 0,
  this_period_materials_stored numeric(14,2) not null default 0,

  -- Computed values (derived, stored for query performance)
  -- These mirror calculateLineItem() in pay-app.models.ts
  work_to_date                numeric(14,2) generated always as (previous_work + this_period_work) stored,
  materials_to_date           numeric(14,2) generated always as (previous_materials_stored + this_period_materials_stored) stored,
  earned_to_date              numeric(14,2) generated always as (
                                previous_work + this_period_work +
                                previous_materials_stored + this_period_materials_stored
                              ) stored,
  balance_to_finish           numeric(14,2) generated always as (
                                scheduled_value - (
                                  previous_work + this_period_work +
                                  previous_materials_stored + this_period_materials_stored
                                )
                              ) stored,

  -- Flags
  is_change_order_related     boolean not null default false,

  -- Timestamps
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table pay_application_line_items is
  'Schedule of Values line items. Computed columns mirror calculateLineItem() in the app layer. '
  'retainage_held and percent_complete are intentionally omitted as generated columns '
  'because they depend on retainage_percent from the parent pay_application row — '
  'compute them in the application layer or a view.';

comment on column pay_application_line_items.sort_order is
  'Controls display order in the schedule of values grid. Increment by 10 to leave room for inserts.';


-- ─────────────────────────────────────────
-- pay_application_change_orders
-- Individual change orders (when mode = 'individual').
-- Only populated when change_order_mode = 'individual'.
-- When mode = 'totals-only', use change_order_total_amount on the parent row.
-- ─────────────────────────────────────────

create table pay_application_change_orders (
  id                    uuid primary key default gen_random_uuid(),
  pay_application_id    uuid not null references pay_applications(id) on delete cascade,

  co_number             text not null default '',
  description           text not null default '',
  amount                numeric(14,2) not null default 0,

  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table pay_application_change_orders is
  'Individual change order line items. Only used when change_order_mode = ''individual''.';


-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

-- Most common query: list all pay apps for a user
create index idx_pay_applications_user_id
  on pay_applications(user_id);

-- Filter by status (draft list, finalized history)
create index idx_pay_applications_user_status
  on pay_applications(user_id, status);

-- Line items by parent
create index idx_line_items_pay_application_id
  on pay_application_line_items(pay_application_id, sort_order);

-- Change orders by parent
create index idx_change_orders_pay_application_id
  on pay_application_change_orders(pay_application_id, sort_order);

-- Corrected draft lookup (find all corrections of a given finalized app)
create index idx_pay_applications_corrected_from
  on pay_applications(corrected_from_id)
  where corrected_from_id is not null;


-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pay_applications_updated_at
  before update on pay_applications
  for each row execute function update_updated_at();

create trigger line_items_updated_at
  before update on pay_application_line_items
  for each row execute function update_updated_at();

create trigger change_orders_updated_at
  before update on pay_application_change_orders
  for each row execute function update_updated_at();


-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

alter table pay_applications enable row level security;
alter table pay_application_line_items enable row level security;
alter table pay_application_change_orders enable row level security;

-- pay_applications: users own their own rows
create policy "Users can view their own pay applications"
  on pay_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own pay applications"
  on pay_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pay applications"
  on pay_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own pay applications"
  on pay_applications for delete
  using (auth.uid() = user_id);

-- line_items: access granted via parent pay_application ownership
create policy "Users can view line items on their pay applications"
  on pay_application_line_items for select
  using (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

create policy "Users can insert line items on their pay applications"
  on pay_application_line_items for insert
  with check (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

create policy "Users can update line items on their pay applications"
  on pay_application_line_items for update
  using (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

create policy "Users can delete line items on their pay applications"
  on pay_application_line_items for delete
  using (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

-- change_orders: same pattern as line_items
create policy "Users can view change orders on their pay applications"
  on pay_application_change_orders for select
  using (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

create policy "Users can insert change orders on their pay applications"
  on pay_application_change_orders for insert
  with check (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

create policy "Users can update change orders on their pay applications"
  on pay_application_change_orders for update
  using (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );

create policy "Users can delete change orders on their pay applications"
  on pay_application_change_orders for delete
  using (
    exists (
      select 1 from pay_applications pa
      where pa.id = pay_application_id
        and pa.user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────
-- CONVENIENCE VIEW: sov_line_items_computed
-- Joins back to parent for retainage_percent so the app
-- can query fully-computed line item data in one shot.
-- ─────────────────────────────────────────

create or replace view sov_line_items_computed as
select
  li.id,
  li.pay_application_id,
  li.sort_order,
  li.line_number,
  li.description,
  li.scheduled_value,
  li.previous_work,
  li.this_period_work,
  li.previous_materials_stored,
  li.this_period_materials_stored,
  -- Generated columns from table
  li.work_to_date,
  li.materials_to_date,
  li.earned_to_date,
  li.balance_to_finish,
  li.is_change_order_related,
  -- Computed using parent retainage_percent
  round(li.earned_to_date * (pa.retainage_percent / 100), 2)          as retainage_held,
  case
    when li.scheduled_value > 0
    then round((li.earned_to_date / li.scheduled_value) * 100, 2)
    else 0
  end                                                                   as percent_complete,
  -- Warning flags (mirrors calculateLineItem() warning logic)
  li.earned_to_date > li.scheduled_value                               as has_overbill_warning,
  li.this_period_work < 0 or li.this_period_materials_stored < 0       as has_negative_warning,
  li.created_at,
  li.updated_at
from pay_application_line_items li
join pay_applications pa on pa.id = li.pay_application_id;

comment on view sov_line_items_computed is
  'Fully computed schedule of values line item view. Includes retainage_held and percent_complete '
  'which require the parent retainage_percent. RLS is enforced via the underlying tables.';
