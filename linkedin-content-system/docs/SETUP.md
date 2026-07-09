# Setup

## 1. Supabase

1. Create a project at supabase.com.
2. Run the migration: paste `supabase/migrations/0001_init.sql` into the SQL editor (or `supabase db push` if you use the CLI).
3. Grab `Project URL` and the `service_role` key (Settings → API) — this system only ever runs server-side (your machine or GitHub Actions), so the service-role key is fine here; never ship it to a browser.
4. Seed one row so generation has something to aim at:
   ```sql
   insert into positioning_goals (goal_text, icp, status)
   values ('<what you want to be known for>', '<who you''re trying to reach>', 'active');
   ```

## 2. Anthropic

Create an API key at console.anthropic.com. All analysis/generation calls use `claude-sonnet-5`.

## 3. Notion

1. Create an internal integration at notion.so/my-integrations, copy its secret.
2. Create two databases and share both with the integration:
   - **Approval queue** — properties: `Name` (title, default), `Status` (select: `Pending Review`, `Approved`, `Rejected`, `Posted`), `Type` (select: `Post`, `Connection Note`, `Profile Suggestion`), `Brief` (text), `Goal Fit Notes` (text), `Supabase ID` (text).
   - **Profile tasks** — properties: `Name` (title, default). Anything else is optional; findings go in the page body.
3. Copy each database's **data source ID** (not the database/page ID — Notion databases can have multiple data sources, and page creation targets a data source) into `NOTION_CONTENT_DATA_SOURCE_ID` / `NOTION_PROFILE_TASKS_DATA_SOURCE_ID`. In the Notion UI this is exposed via the database's "..." menu → "Copy data source ID", or via the API's `GET /v1/databases/{id}` response (`data_sources[0].id`).

## 4. Local env

```
cd linkedin-content-system
npm install
cp .env.example .env   # fill in the values from steps 1-3
```

## 5. First run

1. Settings → "Get a copy of your data" on LinkedIn → request the export that includes Posts, Comments, and Profile → wait for the email → unzip it.
2. `npm run import:export -- /path/to/unzipped/export`
3. `npm run analyze:voice`
4. `npm run generate -- --brief "whatever you want the first batch to be about"`
5. `npm run push:notion` — drafts now sit in your Notion approval queue.
6. Review/edit/approve in Notion, post manually on LinkedIn, set `Status` to `Posted`.
7. `npm run sync:notion` — mirrors your decisions back into Supabase.

## 6. Automation (optional)

Add the same env vars as GitHub Actions repo secrets and the workflows in `.github/workflows/` will run on schedule (monthly voice analysis + profile review, weekly generation). All of them only write to Supabase/Notion.
