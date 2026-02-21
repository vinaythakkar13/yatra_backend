import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminSession } from '../entities/admin-session.entity';
import { Hotel } from '../entities/hotel.entity';
import { LoginDto } from './dto/login.dto';
import { HotelLoginDto } from './dto/hotel-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private adminSessionRepository: Repository<AdminSession>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateToken(user: AdminUser | Hotel): string {
    const payload: any = {
      id: user.id,
    };

    if ('email' in user) {
      payload.email = (user as any).email;
      payload.role = (user as any).role;
    } else {
      payload.login_id = (user as any).login_id;
      payload.name = (user as any).name;
      payload.role = 'hotel';
    }

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    return this.jwtService.sign(payload, { expiresIn: expiresIn as any });
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

  async hotelLogin(hotelLoginDto: HotelLoginDto, ipAddress: string, userAgent: string) {
    const hotel = await this.hotelRepository.findOne({
      where: { login_id: hotelLoginDto.login_id },
    });

    console.log('[hotelLogin] Hotel found:', !!hotel);
    if (!hotel) {
      throw new UnauthorizedException('Invalid login ID or password');
    }

    console.log('[hotelLogin] Hotel ID:', hotel.id);
    console.log('[hotelLogin] Hotel Login ID:', hotel.login_id);
    console.log('[hotelLogin] verifyPassword type:', typeof hotel.verifyPassword);

    if (!hotel.is_active) {
      throw new UnauthorizedException('Hotel account is deactivated');
    }

    const isPasswordValid = await hotel.verifyPassword(hotelLoginDto.password);
    console.log('[hotelLogin] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login ID or password');
    }

    console.log('[hotelLogin] Generating token...');
    const token = this.generateToken(hotel);
    console.log('[hotelLogin] Token generated');

    return {
      token,
      hotel: {
        id: hotel.id,
        login_id: hotel.login_id,
        name: hotel.name,
        role: 'hotel',
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
