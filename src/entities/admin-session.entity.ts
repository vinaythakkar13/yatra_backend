import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('admin_sessions')
@Index('idx_sessions_admin', ['admin_id'])
@Index('idx_sessions_token', ['token_hash'], { unique: true })
@Index('idx_sessions_expires', ['expires_at'])
@Index('idx_sessions_active', ['is_active'])
export class AdminSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'admin_id' })
  admin_id: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'token_hash' })
  token_hash: string;

  @Column({ type: 'text', nullable: true, name: 'device_info' })
  device_info: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ip_address: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  user_agent: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', name: 'last_activity' })
  last_activity: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  is_active: boolean;

  @ManyToOne(() => AdminUser, (admin) => admin.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminUser;

  isExpired(): boolean {
    return this.expires_at < new Date();
  }
}
