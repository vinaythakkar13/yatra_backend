import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AdminUser } from '../../entities/admin-user.entity';
import { AdminSession } from '../../entities/admin-session.entity';
import { Hotel } from '../../entities/hotel.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private adminSessionRepository: Repository<AdminSession>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) { }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded: any;
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      decoded = jwt.verify(token, jwtSecret);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }

    // ── Hotel token path ──────────────────────────────────────────────────────
    // Hotel tokens have role = 'hotel' and are stateless (no AdminSession row).
    // Use DataSource directly so no per-module TypeOrmModule.forFeature is needed.
    if (decoded.role === 'hotel') {
      const hotel = await this.dataSource
        .getRepository(Hotel)
        .findOne({ where: { id: decoded.id } });

      if (!hotel) {
        throw new UnauthorizedException('Hotel not found');
      }

      if (!hotel.is_active) {
        throw new UnauthorizedException('Hotel account is deactivated');
      }

      request.user = {
        id: hotel.id,
        login_id: hotel.login_id,
        name: hotel.name,
        role: 'hotel',
      };

      return true;
    }

    // ── Admin token path ──────────────────────────────────────────────────────
    const tokenHash = this.hashToken(token);
    const session = await this.adminSessionRepository.findOne({
      where: {
        token_hash: tokenHash,
        is_active: true,
      },
      relations: ['admin'],
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or expired');
    }

    if (session.expires_at < new Date()) {
      await this.adminSessionRepository.update(session.id, { is_active: false });
      throw new UnauthorizedException('Session has expired');
    }

    const admin = await this.adminUserRepository.findOne({
      where: { id: decoded.id },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin user not found');
    }

    if (!admin.is_active) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    if (admin.isLocked()) {
      throw new UnauthorizedException('Account is locked');
    }

    // Update last activity
    await this.adminSessionRepository.update(session.id, {
      last_activity: new Date(),
    });

    // Attach to request — populate both request.admin and request.user
    const userPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    };
    request.admin = userPayload;
    request.user = userPayload;

    return true;
  }
}
