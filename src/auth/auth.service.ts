import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminSession } from '../entities/admin-session.entity';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private adminSessionRepository: Repository<AdminSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateToken(admin: AdminUser): string {
    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    return this.jwtService.sign(payload as any, { expiresIn: expiresIn as any });
  }

  getExpirationDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  async createSuperAdmin(createAdminDto: CreateAdminDto, requestingAdmin?: any) {
    const existingSuperAdmin = await this.adminUserRepository.findOne({
      where: { role: 'super_admin' as any, is_active: true },
    });

    if (existingSuperAdmin && !requestingAdmin) {
      throw new UnauthorizedException(
        'Super admin already exists. Authentication required to create additional super admins.',
      );
    }

    if (existingSuperAdmin && requestingAdmin && requestingAdmin.role !== 'super_admin') {
      throw new UnauthorizedException('Only super admins can create other super admins');
    }

    const existingUser = await this.adminUserRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const adminData = {
      email: createAdminDto.email,
      password_hash: createAdminDto.password, // Will be hashed by entity hook
      name: createAdminDto.name,
      role: 'super_admin' as any,
      permissions: createAdminDto.permissions || [],
      is_active: true,
      email_verified: true,
      ...(createAdminDto.contact_number && { contact_number: createAdminDto.contact_number }),
    };

    const admin = this.adminUserRepository.create(adminData);
    const savedResult = await this.adminUserRepository.save(admin);
    const savedAdmin = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    if (!savedAdmin || !savedAdmin.id) {
      throw new BadRequestException('Failed to create admin user');
    }

    return {
      id: savedAdmin.id,
      email: savedAdmin.email,
      name: savedAdmin.name,
      role: savedAdmin.role,
      contact_number: savedAdmin.contact_number || undefined,
      createdAt: savedAdmin.created_at,
    };
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const admin = await this.adminUserRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (admin.isLocked()) {
      throw new UnauthorizedException('Account is locked. Please try again later.');
    }

    const isPasswordValid = await admin.verifyPassword(loginDto.password);

    if (!isPasswordValid) {
      const updateData: any = {
        failed_login_attempts: admin.failed_login_attempts + 1,
      };
      if (admin.failed_login_attempts >= 4) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000);
      }
      await this.adminUserRepository.update(admin.id, updateData);

      throw new UnauthorizedException('Invalid email or password');
    }

    await this.adminUserRepository.update(admin.id, {
      failed_login_attempts: 0,
      last_login: new Date(),
    });

    const token = this.generateToken(admin);
    const tokenHash = this.hashToken(token);

    const session = this.adminSessionRepository.create({
      admin_id: admin.id,
      token_hash: tokenHash,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: this.getExpirationDate(7),
      device_info: userAgent,
    });

    await this.adminSessionRepository.save(session);

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }

  async logout(token: string) {
    if (token) {
      const tokenHash = this.hashToken(token);
      await this.adminSessionRepository.delete({ token_hash: tokenHash });
    }
  }

  async getCurrentAdmin(adminId: string) {
    const admin = await this.adminUserRepository.findOne({
      where: { id: adminId },
      select: ['id', 'email', 'name', 'role', 'permissions', 'contact_number', 'created_at'],
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    return admin;
  }

  async listAdmins() {
    return await this.adminUserRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'permissions',
        'is_active',
        'email_verified',
        'last_login',
        'created_at',
      ],
      order: { created_at: 'DESC' },
    });
  }
}
