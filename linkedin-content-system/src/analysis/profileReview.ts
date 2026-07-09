import { getSupabase } from "../lib/supabaseClient.js";
import { askClaudeForJson } from "../lib/claudeClient.js";
import { createNotionTask } from "../lib/notionTasks.js";
import { env } from "../lib/env.js";
import type { PositioningGoal, ProfileReview, VoiceAnalysis } from "../types/db.js";

interface ReviewResult {
  findings: ProfileReview["findings"];
}

/** Usage: npm run review:profile */
async function main() {
  const supabase = getSupabase();

  const [{ data: snapshotRows, error: snapshotError }, { data: goalRows, error: goalError }, { data: analysisRows, error: analysisError }] =
    await Promise.all([
      supabase.from("profile_snapshots").select("*").order("captured_at", { ascending: false }).limit(1),
      supabase.from("positioning_goals").select("*").eq("status", "active").order("effective_from", { ascending: false }).limit(1),
      supabase.from("voice_analyses").select("*").order("created_at", { ascending: false }).limit(1),
    ]);

  if (snapshotError) throw snapshotError;
  if (goalError) throw goalError;
  if (analysisError) throw analysisError;

  const snapshot = snapshotRows?.[0];
  if (!snapshot) {
    console.log("No profile snapshot yet. Run `npm run import:export` first.");
    return;
  }

  const activeGoal = (goalRows?.[0] as PositioningGoal | undefined) ?? null;
  const latestAnalysis = (analysisRows?.[0] as VoiceAnalysis | undefined) ?? null;

  const result = await askClaudeForJson<ReviewResult>({
    system: `You review a LinkedIn profile (headline, about section) against the person's stated positioning goal
and their actual voice/themes from recent posts. Return strict JSON:
{ "findings": [{"field": "headline"|"about"|"experience"|"skills", "issue": string, "suggestion": string}] }
Only include findings that are specific and actionable — skip generic advice like "add more keywords".
If the profile is well-aligned, return an empty findings array.`,
    user: `Current headline: ${snapshot.headline ?? "(none)"}
Current about: ${snapshot.about ?? "(none)"}

Positioning goal: ${activeGoal?.goal_text ?? "none set"}
ICP: ${activeGoal?.icp ?? "none set"}

Recent voice themes: ${latestAnalysis ? JSON.stringify(latestAnalysis.themes) : "no analysis yet"}
Tone notes: ${latestAnalysis?.tone_notes ?? "n/a"}`,
    maxTokens: 2048,
  });

  const { data: review, error: insertError } = await supabase
    .from("profile_reviews")
    .insert({
      based_on_analysis_id: latestAnalysis?.id ?? null,
      based_on_goal_id: activeGoal?.id ?? null,
      findings: result.findings,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  if (result.findings.length === 0) {
    console.log(`Profile review ${review.id}: no actionable findings this cycle.`);
    return;
  }

  const notionTaskId = await createNotionTask({
    databaseId: env.NOTION_PROFILE_TASKS_DATABASE_ID(),
    title: `LinkedIn profile review — ${result.findings.length} finding(s)`,
    body: result.findings
      .map((finding) => `${finding.field.toUpperCase()}\nIssue: ${finding.issue}\nSuggestion: ${finding.suggestion}`)
      .join("\n\n"),
  });

  await supabase.from("profile_reviews").update({ notion_task_id: notionTaskId }).eq("id", review.id);
  console.log(`Profile review ${review.id} → Notion task ${notionTaskId}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
