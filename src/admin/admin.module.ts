import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { YatraRegistration } from '../entities/yatra-registration.entity';
import { Person } from '../entities/person.entity';
import { Hotel } from '../entities/hotel.entity';
import { Room } from '../entities/room.entity';
import { Yatra } from '../entities/yatra.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            YatraRegistration,
            Person,
            Hotel,
            Room,
            Yatra,
        ]),
    ],
    controllers: [AdminDashboardController],
    providers: [AdminDashboardService],
})
export class AdminModule { }
