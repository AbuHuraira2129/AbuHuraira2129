import { getSupabase } from "../lib/supabaseClient.js";
import { askClaudeForJson } from "../lib/claudeClient.js";
import type { PositioningGoal, Prospect } from "../types/db.js";

interface NoteResult {
  note: string;
}

function parseArgs(argv: string[]) {
  const minScoreFlag = getFlag(argv, "--min-score");
  return { minScore: minScoreFlag ? Number(minScoreFlag) : 70 };
}

function getFlag(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

/**
 * Drafts a fully custom connection note per prospect (per the "fully custom,
 * not templated" decision) for scored prospects above --min-score that are
 * still status='identified'. Writes the note onto the prospect row and also
 * queues it in generated_content so it goes through the same Notion approval
 * gate as posts. Moves prospect status to 'drafted' — never 'connected';
 * that only happens when you click connect yourself.
 *
 * Usage: npm run draft:connection-note -- --min-score 70
 */
async function main() {
  const { minScore } = parseArgs(process.argv.slice(2));
  const supabase = getSupabase();

  const [{ data: goalRows, error: goalError }, { data: prospects, error: prospectsError }] = await Promise.all([
    supabase.from("positioning_goals").select("*").eq("status", "active").order("effective_from", { ascending: false }).limit(1),
    supabase.from("prospects").select("*").eq("status", "identified").gte("score", minScore),
  ]);

  if (goalError) throw goalError;
  if (prospectsError) throw prospectsError;

  const activeGoal = (goalRows?.[0] as PositioningGoal | undefined) ?? null;

  if (!prospects || prospects.length === 0) {
    console.log(`No identified prospects scoring >= ${minScore}. Run \`npm run score:prospects\` first.`);
    return;
  }

  for (const prospect of prospects as Prospect[]) {
    const result = await askClaudeForJson<NoteResult>({
      system: `You write a short, specific LinkedIn connection request note (under 300 characters) for one prospect.
No generic templates — reference something real about the prospect (their role, company, or the note about them).
Return strict JSON: { "note": string }`,
      user: `Your positioning: ${activeGoal?.goal_text ?? "not specified"}

Prospect: ${prospect.name}, ${prospect.title ?? "?"} at ${prospect.company ?? "?"}
Notes on prospect: ${prospect.note ?? "none"}
Why they scored well: ${prospect.score_reason ?? "not scored"}`,
      maxTokens: 512,
    });

    const { error: updateError } = await supabase
      .from("prospects")
      .update({ connection_note: result.note, status: "drafted", updated_at: new Date().toISOString() })
      .eq("id", prospect.id);
    if (updateError) throw updateError;

    const { error: insertError } = await supabase.from("generated_content").insert({
      type: "connection_note",
      brief: `Connection note for ${prospect.name} (${prospect.company ?? "?"})`,
      content: result.note,
      status: "pending",
      goal_id: activeGoal?.id ?? null,
    });
    if (insertError) throw insertError;

    console.log(`Drafted note for ${prospect.name}.`);
  }

  console.log(`Drafted ${prospects.length} connection note(s). Run \`npm run push:notion\` to queue for review.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
