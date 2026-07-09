import { getSupabase } from "../lib/supabaseClient.js";
import { askClaudeForJson } from "../lib/claudeClient.js";
import type { PositioningGoal, Prospect } from "../types/db.js";

interface ScoreResult {
  scores: Array<{ id: string; score: number; reason: string }>;
}

/**
 * Scores unscored prospects against the current ICP (positioning_goals.icp).
 * Never touches status or connects — purely ranks the identified list so you
 * know who's worth drafting a note for.
 *
 * Usage: npm run score:prospects
 */
async function main() {
  const supabase = getSupabase();

  const [{ data: goalRows, error: goalError }, { data: prospects, error: prospectsError }] = await Promise.all([
    supabase.from("positioning_goals").select("*").eq("status", "active").order("effective_from", { ascending: false }).limit(1),
    supabase.from("prospects").select("*").is("score", null),
  ]);

  if (goalError) throw goalError;
  if (prospectsError) throw prospectsError;

  const activeGoal = (goalRows?.[0] as PositioningGoal | undefined) ?? null;
  if (!activeGoal?.icp) {
    console.error("No ICP set. Set positioning_goals.icp on the active goal first.");
    process.exit(1);
  }

  if (!prospects || prospects.length === 0) {
    console.log("No unscored prospects.");
    return;
  }

  const result = await askClaudeForJson<ScoreResult>({
    system: `You score how well each prospect fits an Ideal Customer Profile (ICP).
Return strict JSON: { "scores": [{"id": string, "score": number (0-100), "reason": string}] }
One entry per prospect, in the order given. Be discriminating — most lists should NOT all score above 70.`,
    user: `ICP: ${activeGoal.icp}

Prospects:
${(prospects as Prospect[])
  .map((prospect) => `- id=${prospect.id} | ${prospect.name} | ${prospect.title ?? "?"} at ${prospect.company ?? "?"} | note: ${prospect.note ?? "none"}`)
  .join("\n")}`,
    maxTokens: 4096,
  });

  for (const scored of result.scores) {
    const { error } = await supabase
      .from("prospects")
      .update({ score: scored.score, score_reason: scored.reason, updated_at: new Date().toISOString() })
      .eq("id", scored.id);
    if (error) throw error;
  }

  console.log(`Scored ${result.scores.length} prospect(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
