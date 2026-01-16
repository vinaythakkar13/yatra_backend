import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { YatraRegistration } from '../entities/yatra-registration.entity';
import { Person } from '../entities/person.entity';
import { RegistrationLog } from '../entities/registration-log.entity';
import { User } from '../entities/user.entity';
import { Yatra } from '../entities/yatra.entity';
import { Room } from '../entities/room.entity';
import { Hotel } from '../entities/hotel.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminSession } from '../entities/admin-session.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YatraRegistration,
      Person,
      RegistrationLog,
      User,
      Yatra,
      Room,
      Hotel,
      AdminUser,
      AdminSession,
    ]),
    AuthModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
