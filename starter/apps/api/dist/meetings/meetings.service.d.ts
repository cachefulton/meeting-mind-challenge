import { Repository } from 'typeorm';
import type { Meeting as MeetingResponse, MeetingSummary } from '@meeting-mind/shared';
import { Meeting } from './meeting.entity';
import { CreateMeetingDto } from './create-meeting.dto';
import { AnalysisService } from '../analysis/analysis.service';
export declare class MeetingsService {
    private readonly meetingsRepo;
    private readonly analysisService;
    private readonly logger;
    constructor(meetingsRepo: Repository<Meeting>, analysisService: AnalysisService);
    create(dto: CreateMeetingDto): Promise<MeetingResponse>;
    findAll(): Promise<MeetingSummary[]>;
    findOne(id: string): Promise<MeetingResponse>;
    private toResponse;
}
//# sourceMappingURL=meetings.service.d.ts.map