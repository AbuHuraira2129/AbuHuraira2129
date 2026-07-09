export type CaptureSource = "export" | "extension" | "manual";

export interface ProfileSnapshot {
  id: string;
  captured_at: string;
  source: CaptureSource;
  headline: string | null;
  about: string | null;
  experience: unknown[];
  skills: unknown[];
  raw: unknown;
}

export interface Post {
  id: string;
  linkedin_post_id: string | null;
  content: string;
  posted_at: string | null;
  likes: number;
  comments_count: number;
  shares: number;
  theme_tags: string[];
  source: CaptureSource | "generated";
  created_at: string;
}

export interface Comment {
  id: string;
  linkedin_comment_id: string | null;
  content: string;
  posted_at: string | null;
  thread_context: string | null;
  source: CaptureSource;
  created_at: string;
}

export type GoalStatus = "active" | "suggested" | "rejected" | "superseded";

export interface PositioningGoal {
  id: string;
  goal_text: string;
  icp: string | null;
  status: GoalStatus;
  effective_from: string;
  suggested_reason: string | null;
  based_on_analysis_id: string | null;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface VoiceAnalysis {
  id: string;
  created_at: string;
  period_start: string | null;
  period_end: string | null;
  themes: Array<{ name: string; strength: "strong" | "emerging" | "weak"; evidence: string }>;
  tone_notes: string | null;
  gaps: string | null;
  goal_drift_notes: string | null;
  raw: unknown;
}

export interface ProfileReview {
  id: string;
  created_at: string;
  based_on_analysis_id: string | null;
  based_on_goal_id: string | null;
  findings: Array<{ field: string; issue: string; suggestion: string }>;
  notion_task_id: string | null;
}

export type GeneratedContentType = "post" | "connection_note" | "profile_suggestion";
export type GeneratedContentStatus = "pending" | "approved" | "rejected" | "posted";

export interface GeneratedContent {
  id: string;
  created_at: string;
  type: GeneratedContentType;
  brief: string | null;
  content: string;
  status: GeneratedContentStatus;
  goal_id: string | null;
  goal_fit_notes: string | null;
  notion_page_id: string | null;
  buffer_post_id: string | null;
  posted_at: string | null;
  performance: unknown;
}

export type ProspectStatus = "identified" | "drafted" | "connected" | "replied" | "rejected";

export interface Prospect {
  id: string;
  name: string;
  company: string | null;
  title: string | null;
  profile_url: string | null;
  note: string | null;
  icp_segment: string | null;
  score: number | null;
  score_reason: string | null;
  status: ProspectStatus;
  connection_note: string | null;
  created_at: string;
  updated_at: string;
}
