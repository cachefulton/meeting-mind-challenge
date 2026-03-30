import {
  IsString,
  IsNotEmpty,
  IsDateString,
  MaxLength,
} from 'class-validator';
import type { CreateMeetingRequest } from '@meeting-mind/shared';

export class CreateMeetingDto implements CreateMeetingRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  transcriptText!: string;
}
