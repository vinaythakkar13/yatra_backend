import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { EventParticipant } from './event-participant.entity';

export enum EventType {
  RELIGIOUS = 'religious',
  CULTURAL = 'cultural',
  TOUR = 'tour',
  OTHER = 'other',
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('events')
@Index('idx_events_date', ['event_date'])
@Index('idx_events_status', ['status'])
@Index('idx_events_type', ['event_type'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
    name: 'event_type',
  })
  event_type: EventType;

  @Column({ type: 'date', name: 'event_date' })
  event_date: Date;

  @Column({ type: 'time', nullable: true, name: 'start_time' })
  start_time: string;

  @Column({ type: 'time', nullable: true, name: 'end_time' })
  end_time: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true, name: 'max_participants' })
  max_participants: number;

  @Column({ type: 'int', default: 0, name: 'registered_count' })
  registered_count: number;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  is_active: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 0,
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 0,
  })
  updated_at: Date;

  @OneToMany(() => EventParticipant, (participant) => participant.event)
  participants: EventParticipant[];
}
