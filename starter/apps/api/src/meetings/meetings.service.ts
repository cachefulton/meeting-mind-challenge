import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisStatus } from '@meeting-mind/shared';
import type {
  Meeting as MeetingResponse,
  MeetingSummary,
} from '@meeting-mind/shared';
import { Meeting } from './meeting.entity';
import { CreateMeetingDto } from './create-meeting.dto';
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
      title: dto.title,
      occurredAt: dto.occurredAt,
      transcriptText: dto.transcriptText,
    });

    const saved = await this.meetingsRepo.save(meeting);

    try {
      const analysis = await this.analysisService.analyze(saved.transcriptText);
      saved.summary = analysis.summary;
      saved.actionItems = analysis.actionItems;
      saved.decisions = analysis.decisions;
      saved.openQuestions = analysis.openQuestions;
      saved.analysisStatus = AnalysisStatus.Completed;
    } catch (err) {
      this.logger.error(
        `Analysis failed for meeting ${saved.id}`,
        err instanceof Error ? err.stack : err,
      );
      saved.analysisStatus = AnalysisStatus.Failed;
    }

    const updated = await this.meetingsRepo.save(saved);
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
      analysisStatus: m.analysisStatus,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    };
  }
}
