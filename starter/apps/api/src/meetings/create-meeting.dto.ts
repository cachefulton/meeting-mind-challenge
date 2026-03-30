import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import type {
  CreateMeetingRequest,
  UpdateMeetingRequest,
} from '@meeting-mind/shared';

export class CreateMeetingDto implements CreateMeetingRequest {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsDateString()
  occurredAt!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  transcriptText!: string;
}

export class UpdateMeetingDto implements UpdateMeetingRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;
}
