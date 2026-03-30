import { AnalysisStatus, type ActionItem, type Decision, type OpenQuestion } from '@meeting-mind/shared';
export declare class Meeting {
    id: string;
    title: string;
    occurredAt: string;
    transcriptText: string;
    summary: string | null;
    actionItems: ActionItem[];
    decisions: Decision[];
    openQuestions: OpenQuestion[];
    analysisStatus: AnalysisStatus;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=meeting.entity.d.ts.map