import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { YatraRegistration } from './yatra-registration.entity';
import { AdminUser } from './admin-user.entity';

export enum RegistrationAction {
  CREATED = 'created',
  UPDATED = 'updated',
  CANCELLED = 'cancelled',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ChangedByType {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('registration_logs')
@Index('idx_log_registration', ['registration_id'])
@Index('idx_log_action', ['action'])
@Index('idx_log_created', ['created_at'])
@Index('idx_log_changed_by', ['changed_by'])
export class RegistrationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'registration_id' })
  registration_id: string;

  @Column({
    type: 'enum',
    enum: RegistrationAction,
  })
  action: RegistrationAction;

  @Column({ type: 'uuid', nullable: true, name: 'changed_by' })
  changed_by: string;

  @Column({
    type: 'enum',
    enum: ChangedByType,
    nullable: true,
    name: 'changed_by_type',
  })
  changed_by_type: ChangedByType;

  @Column({ type: 'json', nullable: true, name: 'old_values' })
  old_values: any;

  @Column({ type: 'json', nullable: true, name: 'new_values' })
  new_values: any;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'ip_address' })
  ip_address: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  user_agent: string;

  @Column({ 
    type: 'datetime', 
    name: 'created_at', 
    default: () => 'CURRENT_TIMESTAMP',
    insert: false,
    update: false
  })
  created_at: Date;

  @ManyToOne(() => YatraRegistration, (registration) => registration.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration: YatraRegistration;

  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by' })
  changedByAdmin: AdminUser;
}
