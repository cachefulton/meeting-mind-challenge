import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisStatus } from '@meeting-mind/shared';
import type {
  Meeting as MeetingResponse,
  MeetingSummary,
} from '@meeting-mind/shared';
import { Meeting } from './meeting.entity';
import { CreateMeetingDto, UpdateMeetingDto } from './create-meeting.dto';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    @InjectRepository(Meeting)
    private readonly meetingsRepo: Repository<Meeting>,
    private readonly analysisService: AnalysisService,
  ) {}

  async create(dto: CreateMeetingDto): Promise<MeetingResponse> {
    const meeting = this.meetingsRepo.create({
      title: dto.title || 'Untitled Meeting',
      occurredAt: dto.occurredAt,
      transcriptText: dto.transcriptText,
    });

    const saved = await this.meetingsRepo.save(meeting);

    try {
      const analysis = await this.analysisService.analyze(saved.transcriptText);
      saved.title = dto.title || analysis.title;
      saved.summary = analysis.summary;
      saved.actionItems = analysis.actionItems;
      saved.decisions = analysis.decisions;
      saved.openQuestions = analysis.openQuestions;
      saved.insights = analysis.insights;
      saved.sentiment = analysis.sentiment;
      saved.participants = analysis.participants;
      saved.analysisStatus = AnalysisStatus.Completed;
      saved.analysisError = null;
    } catch (err) {
      this.logger.error(
        `Analysis failed for meeting ${saved.id}`,
        err instanceof Error ? err.stack : err,
      );
      saved.analysisStatus = AnalysisStatus.Failed;
      saved.analysisError = err instanceof Error ? err.message : String(err);
    }

    const updated = await this.meetingsRepo.save(saved);
    return this.toResponse(updated);
  }

  async update(id: string, dto: UpdateMeetingDto): Promise<MeetingResponse> {
    const meeting = await this.meetingsRepo.findOne({ where: { id } });
    if (!meeting) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }
    if (dto.title !== undefined) meeting.title = dto.title;
    if (dto.summary !== undefined) meeting.summary = dto.summary;
    if (dto.actionItems !== undefined) meeting.actionItems = dto.actionItems;
    if (dto.decisions !== undefined) meeting.decisions = dto.decisions;
    if (dto.openQuestions !== undefined) meeting.openQuestions = dto.openQuestions;
    if (dto.insights !== undefined) meeting.insights = dto.insights;
    if (dto.sentiment !== undefined) meeting.sentiment = dto.sentiment;
    if (dto.participants !== undefined) meeting.participants = dto.participants;
    const saved = await this.meetingsRepo.save(meeting);
    return this.toResponse(saved);
  }

  async retryAnalysis(id: string): Promise<MeetingResponse> {
    const meeting = await this.meetingsRepo.findOne({ where: { id } });
    if (!meeting) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }

    meeting.analysisStatus = AnalysisStatus.Pending;
    await this.meetingsRepo.save(meeting);

    try {
      const analysis = await this.analysisService.analyze(meeting.transcriptText);
      if (meeting.title === 'Untitled Meeting') {
        meeting.title = analysis.title;
      }
      meeting.summary = analysis.summary;
      meeting.actionItems = analysis.actionItems;
      meeting.decisions = analysis.decisions;
      meeting.openQuestions = analysis.openQuestions;
      meeting.insights = analysis.insights;
      meeting.sentiment = analysis.sentiment;
      meeting.participants = analysis.participants;
      meeting.analysisStatus = AnalysisStatus.Completed;
      meeting.analysisError = null;
    } catch (err) {
      this.logger.error(
        `Retry analysis failed for meeting ${meeting.id}`,
        err instanceof Error ? err.stack : err,
      );
      meeting.analysisStatus = AnalysisStatus.Failed;
      meeting.analysisError = err instanceof Error ? err.message : String(err);
    }

    const updated = await this.meetingsRepo.save(meeting);
    return this.toResponse(updated);
  }

  async findAll(): Promise<MeetingSummary[]> {
    const meetings = await this.meetingsRepo.find({
      select: ['id', 'title', 'occurredAt', 'analysisStatus', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      occurredAt: m.occurredAt,
      analysisStatus: m.analysisStatus,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async findOne(id: string): Promise<MeetingResponse> {
    const meeting = await this.meetingsRepo.findOne({ where: { id } });
    if (!meeting) {
      throw new NotFoundException(`Meeting ${id} not found`);
    }
    return this.toResponse(meeting);
  }

  private toResponse(m: Meeting): MeetingResponse {
    return {
      id: m.id,
      title: m.title,
      occurredAt: m.occurredAt,
      transcriptText: m.transcriptText,
      summary: m.summary,
      actionItems: m.actionItems,
      decisions: m.decisions,
      openQuestions: m.openQuestions,
      insights: m.insights ?? [],
      sentiment: m.sentiment ?? null,
      participants: m.participants ?? [],
      analysisStatus: m.analysisStatus,
      analysisError: m.analysisError,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    };
  }
}
