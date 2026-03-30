import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import { CreateMeetingDto } from './create-meeting.dto';
import type { Meeting as MeetingResponse, MeetingSummary } from '@meeting-mind/shared';
export declare class MeetingsService {
    private readonly meetingsRepo;
    constructor(meetingsRepo: Repository<Meeting>);
    create(dto: CreateMeetingDto): Promise<MeetingResponse>;
    findAll(): Promise<MeetingSummary[]>;
    findOne(id: string): Promise<MeetingResponse>;
    private toResponse;
}
//# sourceMappingURL=meetings.service.d.ts.map