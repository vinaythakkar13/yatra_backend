import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Hotel } from '../entities/hotel.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminSession } from '../entities/admin-session.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Room, Hotel, AdminUser, AdminSession]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
