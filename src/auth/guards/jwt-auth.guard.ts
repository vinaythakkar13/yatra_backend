import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../entities/admin-user.entity';
import { AdminSession } from '../../entities/admin-session.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private adminSessionRepository: Repository<AdminSession>,
    private configService: ConfigService,
  ) {}

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

    // Hash token and check session
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

    // Attach admin to request
    request.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    };

    return true;
  }
}
