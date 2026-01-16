import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

export enum AttendanceStatus {
  REGISTERED = 'registered',
  ATTENDED = 'attended',
  ABSENT = 'absent',
  CANCELLED = 'cancelled',
}

@Entity('event_participants')
@Index('idx_event_participants_event', ['event_id'])
@Index('idx_event_participants_user', ['user_id'])
@Index('idx_event_participants_status', ['attendance_status'])
@Unique('unique_event_user', ['event_id', 'user_id'])
export class EventParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'event_id' })
  event_id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @Column({ type: 'datetime', name: 'registration_date', default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.REGISTERED,
    name: 'attendance_status',
  })
  attendance_status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Event, (event) => event.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventParticipations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
