import { getSupabase } from "../lib/supabaseClient.js";
import { askClaudeForJson } from "../lib/claudeClient.js";
import type { PositioningGoal, VoiceAnalysis } from "../types/db.js";

interface DraftResult {
  drafts: Array<{ content: string; goal_fit_notes: string }>;
}

function parseArgs(argv: string[]) {
  const briefFlag = getFlag(argv, "--brief");
  const brief = briefFlag && briefFlag.trim().length > 0
    ? briefFlag
    : "Pull an angle from recent work — no specific brief given.";
  const count = Number(getFlag(argv, "--count") ?? "3");
  return { brief, count: Number.isFinite(count) && count > 0 ? count : 3 };
}

function getFlag(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

/** Usage: npm run generate -- --brief "topic or angle" --count 3 */
async function main() {
  const { brief, count } = parseArgs(process.argv.slice(2));
  const supabase = getSupabase();

  const [{ data: goalRows, error: goalError }, { data: analysisRows, error: analysisError }] = await Promise.all([
    supabase.from("positioning_goals").select("*").eq("status", "active").order("effective_from", { ascending: false }).limit(1),
    supabase.from("voice_analyses").select("*").order("created_at", { ascending: false }).limit(1),
  ]);

  if (goalError) throw goalError;
  if (analysisError) throw analysisError;

  const activeGoal = (goalRows?.[0] as PositioningGoal | undefined) ?? null;
  const latestAnalysis = (analysisRows?.[0] as VoiceAnalysis | undefined) ?? null;

  if (!activeGoal) {
    console.error("No active positioning goal set. Insert one into positioning_goals with status='active' first.");
    process.exit(1);
  }

  const result = await askClaudeForJson<DraftResult>({
    system: `You write LinkedIn posts in this person's authentic voice, drafting against a stated positioning goal.
Return strict JSON: { "drafts": [{"content": string, "goal_fit_notes": string}] }
"content" is the full post text, ready to paste into LinkedIn (no hashtags spam, no generic corporate tone).
"goal_fit_notes" is a one-sentence honest self-check: does this draft actually serve the stated goal, or is it drifting?
Generate exactly ${count} distinct drafts, each a different angle on the brief.`,
    user: `Positioning goal: ${activeGoal.goal_text}
ICP: ${activeGoal.icp ?? "not specified"}

Voice notes: ${latestAnalysis?.tone_notes ?? "no voice analysis yet — write in a direct, specific, non-corporate tone"}
Known strong themes: ${latestAnalysis ? JSON.stringify(latestAnalysis.themes) : "none recorded yet"}

Brief for this batch: ${brief}`,
    maxTokens: 4096,
  });

  const rows = result.drafts.map((draft) => ({
    type: "post" as const,
    brief,
    content: draft.content,
    goal_fit_notes: draft.goal_fit_notes,
    goal_id: activeGoal.id,
    status: "pending" as const,
  }));

  const { data: inserted, error: insertError } = await supabase.from("generated_content").insert(rows).select();
  if (insertError) throw insertError;

  console.log(`Generated ${inserted?.length ?? 0} draft(s). Run \`npm run push:notion\` to send them to the approval queue.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
