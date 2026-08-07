import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AvailabilityRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  areaName: string;

  @Column('time')
  dayStartTime: string;

  @Column('time')
  dayEndTime: string;

  @Column('int')
  slotDurationMinutes: number;

  @Column('int')
  maxCapacityPerSlot: number;

  @Column('int')
  minCapacityPerSlot: number;

  @Column('date', { nullable: true })
  ruleExpiredDate: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
