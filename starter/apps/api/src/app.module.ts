import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { MeetingsModule } from './meetings/meetings.module';
import { dataSourceOptions } from './database/data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    HealthModule,
    MeetingsModule,
  ],
})
export class AppModule {}
