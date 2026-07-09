import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env.js";

export function getClaude() {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY() });
}

export const CLAUDE_MODEL = "claude-sonnet-5";

/** Calls Claude and requires a single top-level JSON object back. Throws on non-JSON. */
export async function askClaudeForJson<T>(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const claude = getClaude();
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude response contained no text block");
  }

  const match = textBlock.text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`Claude response was not JSON: ${textBlock.text.slice(0, 200)}`);
  }

  return JSON.parse(match[0]) as T;
}
