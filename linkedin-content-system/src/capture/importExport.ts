import { getSupabase } from "../lib/supabaseClient.js";
import { parseProfile, parsePosts, parseComments } from "./parseExport.js";

/** Usage: npm run import:export -- /path/to/unzipped/linkedin-export */
async function main() {
  const exportDir = process.argv[2];
  if (!exportDir) {
    console.error("Usage: npm run import:export -- <path-to-unzipped-export>");
    process.exit(1);
  }

  const supabase = getSupabase();

  const profile = await parseProfile(exportDir);
  if (profile) {
    const { error } = await supabase.from("profile_snapshots").insert({
      source: "export",
      headline: profile.headline,
      about: profile.about,
      raw: profile.raw,
    });
    if (error) throw error;
    console.log("Imported 1 profile snapshot.");
  } else {
    console.log("No Profile.csv found, skipping.");
  }

  const posts = await parsePosts(exportDir);
  if (posts.length > 0) {
    const { error } = await supabase
      .from("posts")
      .upsert(
        posts.map((post) => ({ ...post, source: "export" })),
        { onConflict: "linkedin_post_id", ignoreDuplicates: true }
      );
    if (error) throw error;
  }
  console.log(`Imported ${posts.length} posts.`);

  const comments = await parseComments(exportDir);
  if (comments.length > 0) {
    const { error } = await supabase
      .from("comments")
      .upsert(
        comments.map((comment) => ({ ...comment, source: "export" })),
        { onConflict: "linkedin_comment_id", ignoreDuplicates: true }
      );
    if (error) throw error;
  }
  console.log(`Imported ${comments.length} comments.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
