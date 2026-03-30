import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AnalysisStatus,
  type ActionItem,
  type Decision,
  type OpenQuestion,
} from '@meeting-mind/shared';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'date' })
  occurredAt!: string;

  @Column({ type: 'text' })
  transcriptText!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  actionItems!: ActionItem[];

  @Column({ type: 'jsonb', default: '[]' })
  decisions!: Decision[];

  @Column({ type: 'jsonb', default: '[]' })
  openQuestions!: OpenQuestion[];

  @Column({
    type: 'enum',
    enum: Object.values(AnalysisStatus),
    default: AnalysisStatus.Pending,
  })
  analysisStatus!: AnalysisStatus;

  @Column({ type: 'text', nullable: true })
  analysisError!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
