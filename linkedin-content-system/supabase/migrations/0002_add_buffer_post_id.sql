-- Tracks the Buffer post created for a generated_content row, mirroring notion_page_id.
-- Buffer posts are created with schedulingType='notification' so nothing actually
-- publishes without a manual approve tap in Buffer — same human gate as everything else.
alter table generated_content add column buffer_post_id text;
