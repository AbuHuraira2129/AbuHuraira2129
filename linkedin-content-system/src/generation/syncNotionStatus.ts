import { getSupabase } from "../lib/supabaseClient.js";
import { getNotion } from "../lib/notionClient.js";
import { env } from "../lib/env.js";
import type { GeneratedContentStatus } from "../types/db.js";

const NOTION_TO_STATUS: Record<string, GeneratedContentStatus> = {
  "Pending Review": "pending",
  Approved: "approved",
  Rejected: "rejected",
  Posted: "posted",
};

/**
 * Reads the Status select value back from Notion for every generated_content
 * row already pushed there, and mirrors it into Supabase. This is the other
 * half of the approval gate: you change the select in Notion, this script
 * (or a cron running it) is what makes the system aware you approved/rejected/
 * posted something. It never writes to Notion or to LinkedIn.
 *
 * Usage: npm run sync:notion
 */
async function main() {
  const supabase = getSupabase();
  const notion = getNotion();

  const { data: rows, error } = await supabase
    .from("generated_content")
    .select("id, status, notion_page_id")
    .not("notion_page_id", "is", null)
    .neq("status", "posted");

  if (error) throw error;
  if (!rows || rows.length === 0) {
    console.log("Nothing to sync.");
    return;
  }

  let changed = 0;
  for (const row of rows) {
    const page = await notion.pages.retrieve({ page_id: row.notion_page_id! });
    if (!("properties" in page)) continue;

    const statusProp = page.properties["Status"];
    if (statusProp?.type !== "select" || !statusProp.select) continue;

    const nextStatus = NOTION_TO_STATUS[statusProp.select.name];
    if (!nextStatus || nextStatus === row.status) continue;

    const update: Record<string, unknown> = { status: nextStatus };
    if (nextStatus === "posted") update.posted_at = new Date().toISOString();

    const { error: updateError } = await supabase.from("generated_content").update(update).eq("id", row.id);
    if (updateError) throw updateError;

    console.log(`${row.id}: ${row.status} -> ${nextStatus}`);
    changed += 1;
  }

  console.log(`Synced ${changed} row(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
