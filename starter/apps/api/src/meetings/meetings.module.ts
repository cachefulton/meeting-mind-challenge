import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './meeting.entity';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting]), AnalysisModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [TypeOrmModule, MeetingsService],
})
export class MeetingsModule {}
