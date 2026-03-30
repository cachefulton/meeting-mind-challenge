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

export enum AnalysisStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

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
  createdAt: string;
  updatedAt: string;
}

// --- API request / response DTOs ---

export interface CreateMeetingRequest {
  title: string;
  occurredAt: string;
  transcriptText: string;
}

export interface MeetingSummary {
  id: string;
  title: string;
  occurredAt: string;
  analysisStatus: AnalysisStatus;
  createdAt: string;
}
