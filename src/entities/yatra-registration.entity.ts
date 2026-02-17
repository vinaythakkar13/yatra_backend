import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Yatra } from './yatra.entity';
import { Person } from './person.entity';
import { RegistrationLog } from './registration-log.entity';
import { TicketType } from '../registrations/enums/ticket-type.enum';

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('yatra_registrations')
@Index('idx_registration_user', ['user_id'])
@Index('idx_registration_yatra', ['yatra_id'])
@Index('idx_registration_status', ['status'])
@Index('idx_registration_pnr', ['pnr'])
@Index('idx_registration_whatsapp', ['whatsapp_number'])
export class YatraRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @Column({ type: 'uuid', name: 'yatra_id' })
  yatra_id: string;

  @Column({ type: 'varchar', length: 12, name: 'pnr' })
  pnr: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'split_pnr' })
  split_pnr: string | null;

  @Column({ type: 'varchar', length: 12, nullable: true, name: 'original_pnr' })
  original_pnr: string | null;

  @Column({
    type: 'enum',
    enum: TicketType,
    nullable: true,
    name: 'ticket_type'
  })
  ticket_type: TicketType | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 15, name: 'whatsapp_number' })
  whatsapp_number: string;

  @Column({ type: 'int', name: 'number_of_persons' })
  number_of_persons: number;

  @Column({ type: 'varchar', length: 100, name: 'boarding_city' })
  boarding_city: string;

  @Column({ type: 'varchar', length: 100, name: 'boarding_state' })
  boarding_state: string;

  @Column({ type: 'date', name: 'arrival_date' })
  arrival_date: Date;

  @Column({ type: 'date', name: 'return_date' })
  return_date: Date;

  @Column({ type: 'json', nullable: true, default: () => "'[]'", name: 'ticket_images' })
  ticket_images: string[];

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellation_reason: string | null;

  @Column({ type: 'text', nullable: true, name: 'admin_comments' })
  admin_comments: string;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejection_reason: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
    name: 'document_status'
  })
  document_status: DocumentStatus;

  @Column({ type: 'text', nullable: true, name: 'document_rejection_reason' })
  document_rejection_reason: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'approved_by_admin_id' })
  approved_by_admin_id: string;

  @Column({ type: 'uuid', nullable: true, name: 'rejected_by_admin_id' })
  rejected_by_admin_id: string;

  @Column({ type: 'datetime', nullable: true, name: 'approved_at' })
  approved_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'rejected_at' })
  rejected_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'cancelled_at' })
  cancelled_at: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'cancelled_by_admin_id' })
  cancelled_by_admin_id: string | null;

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Yatra, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'yatra_id' })
  yatra: Yatra;

  @OneToMany(() => Person, (person) => person.registration, { cascade: true })
  persons: Person[];

  @OneToMany(() => RegistrationLog, (log) => log.registration, { cascade: true })
  logs: RegistrationLog[];
}
