-- LinkedIn Content System — initial schema
-- Single-tenant (one LinkedIn account). No RLS: accessed only via service-role key
-- from server-side scripts / GitHub Actions, never from a browser client.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Capture layer
-- ---------------------------------------------------------------------------

create table profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  source text not null check (source in ('export', 'extension', 'manual')),
  headline text,
  about text,
  experience jsonb not null default '[]',
  skills jsonb not null default '[]',
  raw jsonb
);

create index profile_snapshots_captured_at_idx on profile_snapshots (captured_at desc);

create table posts (
  id uuid primary key default gen_random_uuid(),
  linkedin_post_id text unique,
  content text not null,
  posted_at timestamptz,
  likes integer not null default 0,
  comments_count integer not null default 0,
  shares integer not null default 0,
  theme_tags text[] not null default '{}',
  source text not null check (source in ('export', 'extension', 'manual', 'generated')),
  created_at timestamptz not null default now()
);

create index posts_posted_at_idx on posts (posted_at desc);

create table comments (
  id uuid primary key default gen_random_uuid(),
  linkedin_comment_id text unique,
  content text not null,
  posted_at timestamptz,
  thread_context text,
  source text not null check (source in ('export', 'extension', 'manual')),
  created_at timestamptz not null default now()
);

create index comments_posted_at_idx on comments (posted_at desc);

-- ---------------------------------------------------------------------------
-- Positioning + analysis
-- ---------------------------------------------------------------------------

-- Versioned, never overwritten. Only one row may be status='active' at a time
-- (enforced in application code, not a DB constraint, since Postgres partial
-- unique indexes on a mutable predicate are more trouble than they're worth here).
create table positioning_goals (
  id uuid primary key default gen_random_uuid(),
  goal_text text not null,
  icp text,
  status text not null default 'active' check (status in ('active', 'suggested', 'rejected', 'superseded')),
  effective_from timestamptz not null default now(),
  suggested_reason text,
  based_on_analysis_id uuid,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text
);

create index positioning_goals_status_idx on positioning_goals (status);
create index positioning_goals_effective_from_idx on positioning_goals (effective_from desc);

create table voice_analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  period_start timestamptz,
  period_end timestamptz,
  themes jsonb not null default '[]',
  tone_notes text,
  gaps text,
  goal_drift_notes text,
  raw jsonb
);

create index voice_analyses_created_at_idx on voice_analyses (created_at desc);

alter table positioning_goals
  add constraint positioning_goals_based_on_analysis_fk
  foreign key (based_on_analysis_id) references voice_analyses(id);

create table profile_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  based_on_analysis_id uuid references voice_analyses(id),
  based_on_goal_id uuid references positioning_goals(id),
  findings jsonb not null default '[]',
  notion_task_id text
);

-- ---------------------------------------------------------------------------
-- Generation + approval
-- ---------------------------------------------------------------------------

create table generated_content (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('post', 'connection_note', 'profile_suggestion')),
  brief text,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'posted')),
  goal_id uuid references positioning_goals(id),
  goal_fit_notes text,
  notion_page_id text,
  posted_at timestamptz,
  performance jsonb
);

create index generated_content_status_idx on generated_content (status);
create index generated_content_created_at_idx on generated_content (created_at desc);

-- ---------------------------------------------------------------------------
-- Prospecting (human executes every connect/send — this table only tracks state)
-- ---------------------------------------------------------------------------

create table prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  title text,
  profile_url text,
  note text,
  icp_segment text,
  score numeric,
  score_reason text,
  status text not null default 'identified' check (status in ('identified', 'drafted', 'connected', 'replied', 'rejected')),
  connection_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospects_status_idx on prospects (status);
create index prospects_score_idx on prospects (score desc);
