import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Room } from './room.entity';
import { EventParticipant } from './event-participant.entity';
import { YatraRegistration } from './yatra-registration.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
}

@Entity('users')
@Index('idx_users_pnr', ['pnr'], { unique: true })
@Index('idx_users_contact', ['contact_number'])
@Index('idx_users_email', ['email'])
@Index('idx_users_arrival_date', ['arrival_date'])
@Index('idx_users_assigned_room', ['assigned_room_id'])
@Index('idx_users_registration_status', ['registration_status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 15 })
  contact_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', name: 'number_of_persons' })
  number_of_persons: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  pnr: string;

  @Column({ type: 'varchar', length: 100, name: 'boarding_state' })
  boarding_state: string;

  @Column({ type: 'varchar', length: 100, name: 'boarding_city' })
  boarding_city: string;

  @Column({ type: 'varchar', length: 255, name: 'boarding_point' })
  boarding_point: string;

  @Column({ type: 'date', name: 'arrival_date' })
  arrival_date: Date;

  @Column({ type: 'date', name: 'return_date' })
  return_date: Date;

  @Column({ type: 'uuid', name: 'assigned_room_id', nullable: true })
  assigned_room_id: string;

  @Column({ type: 'json', nullable: true, default: () => "'[]'" })
  ticket_images: string[];

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
    name: 'registration_status',
  })
  registration_status: RegistrationStatus;

  @Column({ type: 'boolean', default: false, name: 'is_room_assigned' })
  is_room_assigned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Room, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_room_id' })
  assignedRoom: Room;

  @OneToMany(() => EventParticipant, (participant) => participant.user, { cascade: false })
  eventParticipations: EventParticipant[];

  @OneToMany(() => YatraRegistration, (registration) => registration.user, { cascade: false })
  yatraRegistrations: YatraRegistration[];
}
