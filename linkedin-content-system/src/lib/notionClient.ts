import { Client } from "@notionhq/client";
import { env } from "./env.js";

export function getNotion() {
  return new Client({ auth: env.NOTION_API_KEY() });
}
