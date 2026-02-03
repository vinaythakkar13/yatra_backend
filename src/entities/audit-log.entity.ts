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

@Entity('audit_logs')
@Index('idx_audit_entity', ['entity_type', 'entity_id'])
@Index('idx_audit_admin', ['performed_by_admin_id'])
@Index('idx_audit_action', ['action'])
@Index('idx_audit_created', ['created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true, name: 'entity_id' })
  entity_id: string;

  @Column({ type: 'uuid', nullable: true, name: 'performed_by_admin_id' })
  performed_by_admin_id: string;

  @Column({ type: 'json', nullable: true, name: 'old_data' })
  old_data: any;

  @Column({ type: 'json', nullable: true, name: 'new_data' })
  new_data: any;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ip_address: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  user_agent: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 0,
  })
  created_at: Date;

  @ManyToOne(() => AdminUser, (admin) => admin.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performed_by_admin_id' })
  performedBy: AdminUser;
}
