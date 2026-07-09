# LinkedIn content system

Analyzes profile + activity history, tracks a current positioning goal, generates on-brand content, surfaces prospects, and helps improve the profile over time — without automating anything LinkedIn-facing.

**The constraint that shapes this:** LinkedIn has no public API for reading history, searching people, or auto-connecting at scale, and it actively detects/restricts automated posting, connecting, and scraping. So this system only ever writes to **Supabase** and **Notion**. A human (you) does every LinkedIn click — posting, connecting, sending. Nothing here calls a LinkedIn endpoint or drives a browser against linkedin.com.

```
CAPTURE → STORE → ANALYZE → GENERATE → APPROVE (you, in Notion) → PUBLISH (you, on LinkedIn) → LOG OUTCOMES → RE-ANALYZE
```

## What's here

| Path | Purpose |
|---|---|
| `supabase/migrations/0001_init.sql` | Full schema — see `docs/SCHEMA.md` |
| `src/capture/` | Parses a LinkedIn data export and imports it into Supabase |
| `src/analysis/` | Voice/pattern analysis and profile review, both Claude-driven |
| `src/generation/` | Drafts posts, pushes them to a Notion approval queue, syncs your decisions back |
| `src/prospects/` | Scores prospects against your ICP, drafts custom connection notes |
| `.github/workflows/` | Optional cron: monthly analysis/review, weekly generation |
| `docs/SETUP.md` | Step-by-step setup (Supabase, Anthropic, Notion, first run) |
| `docs/PHASES.md` | Build status against the original 5-phase plan, and the decisions made along the way |
| `docs/SCHEMA.md` | Table-by-table notes |

Start with `docs/SETUP.md`.

## Status

Phases 1, 2, and 4 (partial) are built and runnable today. Phase 3 (browser extension for passive capture) and Phase 5 (extension write-assist) are intentionally not started — see `docs/PHASES.md` for why and what unblocks them.
