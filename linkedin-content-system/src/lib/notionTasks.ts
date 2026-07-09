import { getNotion } from "./notionClient.js";

/** Creates a simple task page (title + body paragraph) in a Notion data source. */
export async function createNotionTask(params: {
  dataSourceId: string;
  title: string;
  body: string;
}): Promise<string> {
  const notion = getNotion();

  const page = await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: params.dataSourceId },
    properties: {
      Name: {
        title: [{ text: { content: params.title.slice(0, 200) } }],
      },
    },
    children: params.body
      .split("\n\n")
      .filter((paragraph) => paragraph.trim().length > 0)
      .map((paragraph) => ({
        object: "block" as const,
        type: "paragraph" as const,
        paragraph: { rich_text: [{ text: { content: paragraph.slice(0, 2000) } }] },
      })),
  });

  return page.id;
}
