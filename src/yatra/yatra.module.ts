import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YatraController } from './yatra.controller';
import { YatraService } from './yatra.service';
import { Yatra } from '../entities/yatra.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminSession } from '../entities/admin-session.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Yatra, AdminUser, AdminSession]),
    AuthModule,
  ],
  controllers: [YatraController],
  providers: [YatraService],
  exports: [YatraService],
})
export class YatraModule {}
