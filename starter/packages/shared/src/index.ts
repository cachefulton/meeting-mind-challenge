/**
 * Shared types for Meeting Mind.
 *
 * Both the API and web app import from "@meeting-mind/shared".
 */

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// --- Meeting domain types ---

/** String union + const object (not a TS enum) so Vite SSR / ESM consumers avoid CommonJS `exports` issues. */
export const AnalysisStatus = {
  Pending: 'pending',
  Completed: 'completed',
  Failed: 'failed',
} as const;

export type AnalysisStatus =
  (typeof AnalysisStatus)[keyof typeof AnalysisStatus];

export interface ActionItem {
  text: string;
  assignee?: string;
}

export interface Decision {
  text: string;
}

export interface OpenQuestion {
  text: string;
}

export interface Meeting {
  id: string;
  title: string;
  occurredAt: string;
  transcriptText: string;
  summary: string | null;
  actionItems: ActionItem[];
  decisions: Decision[];
  openQuestions: OpenQuestion[];
  analysisStatus: AnalysisStatus;
  analysisError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  openQuestions: OpenQuestion[];
}

// --- API request / response DTOs ---

export interface CreateMeetingRequest {
  title?: string;
  occurredAt: string;
  transcriptText: string;
}

export interface UpdateMeetingRequest {
  title: string;
}

export interface MeetingSummary {
  id: string;
  title: string;
  occurredAt: string;
  analysisStatus: AnalysisStatus;
  createdAt: string;
}
