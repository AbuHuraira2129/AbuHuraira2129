# Build phases

| Phase | Status | What it is |
|---|---|---|
| 1 — Foundation | **Built** | Supabase schema, LinkedIn export parser + importer, voice analysis (Claude), profile review. |
| 2 — Generation loop | **Built** | `generate` drafts posts against goal+voice, `push:notion` queues them, `sync:notion` reads back your approve/reject/posted decision. Cron in `.github/workflows/generate-content.yml`. |
| 3 — Chrome extension (capture only) | **Not started** | Passive capture of profile views / feed engagement / live post metrics into `posts`/`comments`/`profile_snapshots` with `source='extension'`. The DB and import paths already support this source value — only the extension itself is unbuilt. Build once Phases 1–2 are proving value, per the original plan. |
| 4 — Prospecting assist | **Built (partial)** | `prospects` table, `score:prospects` (rank against `positioning_goals.icp`), `draft:connection-note` (fully custom note per prospect, per your decision). You still do every actual connect click — nothing here calls LinkedIn. |
| 5 — Extension write-assist | **Not started** | Pre-filling compose/connection-note boxes inside your own session. Explicitly deferred — re-evaluate LinkedIn ToS/detection risk before starting this phase, don't assume Phase 3's safety carries over. |

## Decisions made when this was built

- **Positioning goal changes**: the system *can* suggest a reposition (via `analyze:voice`), but it only ever inserts a row with `status='suggested'` plus a Notion review task — nothing flips to `status='active'` without you doing it (SQL update or a future small approval script).
- **Connection notes**: fully custom per prospect, not templated per ICP segment. Costs one Claude call per prospect in `draft:connection-note`.
- **Profile improvement**: monthly `review:profile` job compares your latest snapshot against the active goal + latest voice analysis and files findings as a Notion task. No auto-edits to your profile, obviously — LinkedIn profile fields aren't writable via API anyway.

## What's intentionally never automated

Nothing in this repo calls a LinkedIn endpoint, drives a headless browser against linkedin.com, or posts/connects on your behalf. Every script's output is either a Supabase row or a Notion page. The human (you) is the only thing that ever touches LinkedIn's UI.
