import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  CreateMeetingRequest,
  UpdateMeetingRequest,
  ActionItem,
  Decision,
  OpenQuestion,
  Insight,
  Participant,
  MeetingSentiment,
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

export class ActionItemDto implements ActionItem {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  priority?: 'high' | 'medium' | 'low';
}

export class DecisionDto implements Decision {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsOptional()
  @IsString()
  rationale?: string;
}

export class OpenQuestionDto implements OpenQuestion {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class InsightDto implements Insight {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  category!: 'theme' | 'risk' | 'observation' | 'follow-up';
}

export class ParticipantDto implements Participant {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateMeetingDto implements UpdateMeetingRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionItemDto)
  actionItems?: ActionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DecisionDto)
  decisions?: DecisionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpenQuestionDto)
  openQuestions?: OpenQuestionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsightDto)
  insights?: InsightDto[];

  @IsOptional()
  @IsString()
  sentiment?: MeetingSentiment | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];
}
