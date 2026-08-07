import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  callSid: string;

  @Column('text', { nullable: true })
  transcript: string;

  @Column({ nullable: true })
  outcome: string;

  @CreateDateColumn()
  createdAt: Date;
}
