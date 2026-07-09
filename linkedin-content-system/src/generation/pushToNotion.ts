import { getSupabase } from "../lib/supabaseClient.js";
import { getNotion } from "../lib/notionClient.js";
import { env } from "../lib/env.js";
import type { GeneratedContent } from "../types/db.js";

const TYPE_LABEL: Record<GeneratedContent["type"], string> = {
  post: "Post",
  connection_note: "Connection Note",
  profile_suggestion: "Profile Suggestion",
};

/**
 * Syncs generated_content rows that have no notion_page_id yet into the
 * Notion approval-queue data source. Expects a database with these properties:
 * Name (title), Status (select: Pending Review/Approved/Rejected/Posted),
 * Type (select), Brief (rich_text), Goal Fit Notes (rich_text),
 * Supabase ID (rich_text).
 *
 * Usage: npm run push:notion
 */
async function main() {
  const supabase = getSupabase();
  const notion = getNotion();
  const dataSourceId = env.NOTION_CONTENT_DATA_SOURCE_ID();

  const { data: drafts, error } = await supabase
    .from("generated_content")
    .select("*")
    .eq("status", "pending")
    .is("notion_page_id", null);

  if (error) throw error;
  if (!drafts || drafts.length === 0) {
    console.log("Nothing new to push.");
    return;
  }

  for (const draft of drafts as GeneratedContent[]) {
    const page = await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties: {
        Name: { title: [{ text: { content: draft.content.slice(0, 80) } }] },
        Status: { select: { name: "Pending Review" } },
        Type: { select: { name: TYPE_LABEL[draft.type] } },
        Brief: { rich_text: [{ text: { content: (draft.brief ?? "").slice(0, 2000) } }] },
        "Goal Fit Notes": { rich_text: [{ text: { content: (draft.goal_fit_notes ?? "").slice(0, 2000) } }] },
        "Supabase ID": { rich_text: [{ text: { content: draft.id } }] },
      },
      children: draft.content
        .split("\n\n")
        .filter((paragraph) => paragraph.trim().length > 0)
        .map((paragraph) => ({
          object: "block" as const,
          type: "paragraph" as const,
          paragraph: { rich_text: [{ text: { content: paragraph.slice(0, 2000) } }] },
        })),
    });

    const { error: updateError } = await supabase
      .from("generated_content")
      .update({ notion_page_id: page.id })
      .eq("id", draft.id);
    if (updateError) throw updateError;

    console.log(`Pushed ${draft.id} -> Notion page ${page.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
