import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './create-meeting.dto';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(dto: CreateMeetingDto): Promise<import("@meeting-mind/shared").Meeting>;
    findAll(): Promise<import("@meeting-mind/shared").MeetingSummary[]>;
    findOne(id: string): Promise<import("@meeting-mind/shared").Meeting>;
}
//# sourceMappingURL=meetings.controller.d.ts.map