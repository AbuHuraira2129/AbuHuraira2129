import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}. See .env.example.`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: () => required("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  ANTHROPIC_API_KEY: () => required("ANTHROPIC_API_KEY"),
  NOTION_API_KEY: () => required("NOTION_API_KEY"),
  NOTION_CONTENT_DATA_SOURCE_ID: () => required("NOTION_CONTENT_DATA_SOURCE_ID"),
  NOTION_PROFILE_TASKS_DATA_SOURCE_ID: () =>
    required("NOTION_PROFILE_TASKS_DATA_SOURCE_ID"),
};
