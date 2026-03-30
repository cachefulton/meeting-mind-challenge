import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import { CreateMeetingDto } from './create-meeting.dto';
import type {
  Meeting as MeetingResponse,
  MeetingSummary,
} from '@meeting-mind/shared';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingsRepo: Repository<Meeting>,
  ) {}

  async create(dto: CreateMeetingDto): Promise<MeetingResponse> {
    const meeting = this.meetingsRepo.create({
      title: dto.title,
      occurredAt: dto.occurredAt,
      transcriptText: dto.transcriptText,
    });

    const saved = await this.meetingsRepo.save(meeting);
    return this.toResponse(saved);
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
