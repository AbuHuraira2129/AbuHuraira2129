import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";

/**
 * LinkedIn's "Get a copy of your data" export ships one CSV per data type,
 * in the same folder. Column names below match LinkedIn's current export
 * format (as of 2026) — LinkedIn changes these occasionally without notice,
 * so a failed parse on one file should not abort the others.
 *
 * Notably absent from the export: like/comment/share counts on your own
 * posts, and full comment thread context. Those only come from the browser
 * extension (Phase 3) or manual entry.
 */

export interface ParsedProfile {
  headline: string | null;
  about: string | null;
  raw: Record<string, string>;
}

export interface ParsedPost {
  linkedin_post_id: string | null;
  content: string;
  posted_at: string | null;
}

export interface ParsedComment {
  linkedin_comment_id: string | null;
  content: string;
  posted_at: string | null;
  thread_context: string | null;
}

async function readCsv(path: string): Promise<Record<string, string>[]> {
  const raw = await readFile(path, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true });
}

export async function parseProfile(exportDir: string): Promise<ParsedProfile | null> {
  const path = join(exportDir, "Profile.csv");
  if (!existsSync(path)) return null;

  const rows = await readCsv(path);
  const row = rows[0];
  if (!row) return null;

  return {
    headline: row["Headline"] ?? null,
    about: row["Summary"] ?? null,
    raw: row,
  };
}

export async function parsePosts(exportDir: string): Promise<ParsedPost[]> {
  const path = join(exportDir, "Shares.csv");
  if (!existsSync(path)) return [];

  const rows = await readCsv(path);
  return rows
    .filter((row) => (row["ShareCommentary"] ?? "").trim().length > 0)
    .map((row) => ({
      linkedin_post_id: row["ShareLink"] || null,
      content: row["ShareCommentary"] ?? "",
      posted_at: normalizeDate(row["Date"]),
    }));
}

export async function parseComments(exportDir: string): Promise<ParsedComment[]> {
  const path = join(exportDir, "Comments.csv");
  if (!existsSync(path)) return [];

  const rows = await readCsv(path);
  return rows
    .filter((row) => (row["Message"] ?? "").trim().length > 0)
    .map((row) => ({
      linkedin_comment_id: row["Link"] || null,
      content: row["Message"] ?? "",
      posted_at: normalizeDate(row["Date"]),
      thread_context: row["Link"] ?? null,
    }));
}

function normalizeDate(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
