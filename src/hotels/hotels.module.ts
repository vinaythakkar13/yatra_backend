import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { Hotel } from '../entities/hotel.entity';
import { Room } from '../entities/room.entity';
import { Yatra } from '../entities/yatra.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminSession } from '../entities/admin-session.entity';
import { YatraRegistration } from '../entities/yatra-registration.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Room, Yatra, AdminUser, AdminSession, YatraRegistration, User]),
    AuthModule,
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService],
})
export class HotelsModule { }
