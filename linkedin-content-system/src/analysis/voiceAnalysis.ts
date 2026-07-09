import { getSupabase } from "../lib/supabaseClient.js";
import { askClaudeForJson } from "../lib/claudeClient.js";
import { createNotionTask } from "../lib/notionTasks.js";
import { env } from "../lib/env.js";
import type { PositioningGoal, VoiceAnalysis } from "../types/db.js";

const ANALYSIS_WINDOW_DAYS = 90;
const DRIFT_THRESHOLD_HINT =
  "Only propose a reposition if the drift is clear and repeated across several posts — not from a single off-topic post.";

interface AnalysisResult {
  themes: VoiceAnalysis["themes"];
  tone_notes: string;
  gaps: string;
  goal_drift_notes: string;
  suggested_reposition: {
    should_suggest: boolean;
    goal_text?: string;
    icp?: string;
    reason?: string;
  };
}

/** Usage: npm run analyze:voice */
async function main() {
  const supabase = getSupabase();
  const since = new Date(Date.now() - ANALYSIS_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: posts, error: postsError }, { data: comments, error: commentsError }, { data: goalRows, error: goalError }] =
    await Promise.all([
      supabase.from("posts").select("*").gte("posted_at", since).order("posted_at", { ascending: false }),
      supabase.from("comments").select("*").gte("posted_at", since).order("posted_at", { ascending: false }),
      supabase.from("positioning_goals").select("*").eq("status", "active").order("effective_from", { ascending: false }).limit(1),
    ]);

  if (postsError) throw postsError;
  if (commentsError) throw commentsError;
  if (goalError) throw goalError;

  if (!posts || posts.length === 0) {
    console.log("No posts in the last 90 days. Run `npm run import:export` first.");
    return;
  }

  const activeGoal = (goalRows?.[0] as PositioningGoal | undefined) ?? null;

  const result = await askClaudeForJson<AnalysisResult>({
    system: `You analyze a LinkedIn user's posting voice and patterns from their raw post/comment history.
Return strict JSON matching this shape:
{
  "themes": [{"name": string, "strength": "strong"|"emerging"|"weak", "evidence": string}],
  "tone_notes": string,
  "gaps": string,
  "goal_drift_notes": string,
  "suggested_reposition": {
    "should_suggest": boolean,
    "goal_text": string (only if should_suggest),
    "icp": string (only if should_suggest),
    "reason": string (only if should_suggest)
  }
}
Be specific and cite actual post content as evidence, not generic advice. ${DRIFT_THRESHOLD_HINT}`,
    user: `Current stated positioning goal: ${activeGoal ? activeGoal.goal_text : "none set"}
Current ICP: ${activeGoal?.icp ?? "none set"}

Posts (last ${ANALYSIS_WINDOW_DAYS} days, ${posts.length} total):
${posts.map((post) => `- [${post.posted_at ?? "undated"}] ${post.content}`).join("\n")}

Comments (last ${ANALYSIS_WINDOW_DAYS} days, ${comments?.length ?? 0} total):
${(comments ?? []).map((comment) => `- [${comment.posted_at ?? "undated"}] ${comment.content}`).join("\n")}`,
    maxTokens: 4096,
  });

  const { data: inserted, error: insertError } = await supabase
    .from("voice_analyses")
    .insert({
      period_start: since,
      period_end: new Date().toISOString(),
      themes: result.themes,
      tone_notes: result.tone_notes,
      gaps: result.gaps,
      goal_drift_notes: result.goal_drift_notes,
      raw: result,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  console.log(`Stored voice analysis ${inserted.id}.`);

  if (result.suggested_reposition.should_suggest && result.suggested_reposition.goal_text) {
    const { data: suggestedGoal, error: suggestError } = await supabase
      .from("positioning_goals")
      .insert({
        goal_text: result.suggested_reposition.goal_text,
        icp: result.suggested_reposition.icp ?? null,
        status: "suggested",
        suggested_reason: result.suggested_reposition.reason ?? null,
        based_on_analysis_id: inserted.id,
      })
      .select()
      .single();

    if (suggestError) throw suggestError;
    console.log(`Suggested new positioning goal ${suggestedGoal.id} (status=suggested, not active).`);

    const notionTaskId = await createNotionTask({
      databaseId: env.NOTION_PROFILE_TASKS_DATABASE_ID(),
      title: "Review suggested LinkedIn repositioning",
      body: [
        `Current goal: ${activeGoal?.goal_text ?? "none set"}`,
        `Suggested goal: ${result.suggested_reposition.goal_text}`,
        `Suggested ICP: ${result.suggested_reposition.icp ?? "unchanged"}`,
        `Reason: ${result.suggested_reposition.reason}`,
        `To approve: set positioning_goals.status='active' for ${suggestedGoal.id} and 'superseded' for the prior active row.`,
      ].join("\n\n"),
    });
    console.log(`Created Notion review task ${notionTaskId}.`);
  } else {
    console.log("No reposition suggested this cycle.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
