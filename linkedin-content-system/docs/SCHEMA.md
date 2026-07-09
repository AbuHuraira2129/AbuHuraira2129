# Schema

See `supabase/migrations/0001_init.sql` for the source of truth. Summary:

- **profile_snapshots** — timestamped headline/about/experience/skills. One row per capture (export, extension, or manual), never overwritten, so profile history is queryable.
- **posts** / **comments** — your own LinkedIn activity. `linkedin_post_id`/`linkedin_comment_id` dedupe re-imports. `source='export'` rows never carry engagement counts (LinkedIn's data export doesn't include them); `source='extension'` rows will once Phase 3 exists.
- **positioning_goals** — versioned, append-only. `status` is one of `active` (exactly one at a time, enforced by convention not a DB constraint), `suggested` (written by `analyze:voice`, needs your approval), `rejected`, `superseded`.
- **voice_analyses** — output of `analyze:voice`: themes with evidence, tone notes, gaps, drift notes.
- **profile_reviews** — output of `review:profile`: findings against the active goal + latest voice analysis.
- **generated_content** — every draft (post or connection note), its approval status, and the Notion page it's mirrored to. `goal_fit_notes` is Claude's own honest check of whether the draft serves the stated goal.
- **prospects** — identified → drafted → connected → replied, human-driven at every transition past `drafted`. `score`/`score_reason` come from `score:prospects` against `positioning_goals.icp`.

## Why no RLS

Every table is accessed only via the `service_role` key from scripts you run locally or in GitHub Actions — never from a browser. Row-level security exists to protect multi-tenant data reachable by an `anon` key; it doesn't apply here. If a browser dashboard is ever added (not planned for v1 — see README), add RLS then, scoped to that access pattern.
