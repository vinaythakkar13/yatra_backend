import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminSession } from './admin-session.entity';
import { AuditLog } from './audit-log.entity';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
}

@Entity('admin_users')
@Index('idx_admin_email', ['email'], { unique: true })
@Index('idx_admin_role', ['role'])
@Index('idx_admin_active', ['is_active'])
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  password_hash: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 15, nullable: true, name: 'contact_number' })
  contact_number: string;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.ADMIN,
  })
  role: AdminRole;

  @Column({ type: 'json', default: () => "'[]'" })
  permissions: string[];

  @Column({ type: 'datetime', nullable: true, name: 'last_login' })
  last_login: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  email_verified: boolean;

  @Column({ type: 'int', default: 0, name: 'failed_login_attempts' })
  failed_login_attempts: number;

  @Column({ type: 'datetime', nullable: true, name: 'locked_until' })
  locked_until: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => AdminSession, (session) => session.admin)
  sessions: AdminSession[];

  @OneToMany(() => AuditLog, (log) => log.performedBy)
  auditLogs: AuditLog[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password_hash && !this.password_hash.startsWith('$2b$')) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password_hash);
  }

  isLocked(): boolean {
    return this.locked_until !== null && this.locked_until > new Date();
  }
}
