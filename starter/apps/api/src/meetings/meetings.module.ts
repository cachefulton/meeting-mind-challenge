import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './meeting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting])],
  exports: [TypeOrmModule],
})
export class MeetingsModule {}
