import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Yatra } from './yatra.entity';
import { Person } from './person.entity';
import { RegistrationLog } from './registration-log.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
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

  @Column({ type: 'varchar', length: 10, name: 'pnr' })
  pnr: string;

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

  @Column({ type: 'uuid', nullable: true, name: 'approved_by_admin_id' })
  approved_by_admin_id: string;

  @Column({ type: 'uuid', nullable: true, name: 'rejected_by_admin_id' })
  rejected_by_admin_id: string;

  @Column({ type: 'datetime', nullable: true, name: 'approved_at' })
  approved_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'rejected_at' })
  rejected_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'cancelled_at' })
  cancelled_at: Date;

  @Column({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
    insert: false,
    update: false
  })
  created_at: Date;

  @Column({
    type: 'datetime',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    insert: false
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
