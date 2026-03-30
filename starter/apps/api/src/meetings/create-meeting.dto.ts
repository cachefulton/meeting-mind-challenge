import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import type { CreateMeetingRequest } from '@meeting-mind/shared';

export class CreateMeetingDto implements CreateMeetingRequest {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  @IsNotEmpty()
  transcriptText!: string;
}
