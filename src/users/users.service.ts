import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Hotel } from '../entities/hotel.entity';
import { LoginPnrDto } from './dto/login-pnr.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  async loginWithPnr(loginPnrDto: LoginPnrDto) {
    const user = await this.userRepository.findOne({
      where: { pnr: loginPnrDto.pnr },
      relations: ['assignedRoom', 'assignedRoom.hotel'],
    });

    if (!user) {
      throw new NotFoundException('No registration found with this PNR');
    }

    let hotelAssignment: any = null;
    if (user.assignedRoom && user.assignedRoom.hotel) {
      hotelAssignment = {
        status: 'assigned',
        hotel_id: user.assignedRoom.hotel.id,
        hotel_name: user.assignedRoom.hotel.name,
        hotel_address: user.assignedRoom.hotel.address,
        hotel_map_link: user.assignedRoom.hotel.map_link,
        room_id: user.assignedRoom.id,
        room_number: user.assignedRoom.room_number,
        floor: user.assignedRoom.floor,
        total_floors: user.assignedRoom.hotel.total_floors,
        hotel_contact: user.assignedRoom.hotel.manager_contact || null,
        is_occupied: user.assignedRoom.is_occupied,
      };
    } else {
      hotelAssignment = {
        status: 'not_assigned',
        message: 'Room not yet assigned. Please check back later or contact admin.',
      };
    }

    const passengerDetailsArray = [
      {
        passenger_number: 1,
        name: user.name,
        contact_number: user.contact_number,
        email: user.email,
        gender: user.gender,
        age: user.age,
        is_primary: true,
      },
    ];

    for (let i = 2; i <= user.number_of_persons; i += 1) {
      passengerDetailsArray.push({
        passenger_number: i,
        name: `Passenger ${i}`,
        contact_number: '',
        email: '',
        gender: '' as any,
        age: 0,
        is_primary: false,
      } as any);
    }

    return {
      pnr: user.pnr,
      number_of_passengers: user.number_of_persons,
      registration_status: user.registration_status,
      passenger_details: passengerDetailsArray,
      boarding_details: {
        state: user.boarding_state,
        city: user.boarding_city,
        boarding_point: user.boarding_point,
      },
      travel_dates: {
        arrival_date: user.arrival_date,
        return_date: user.return_date,
      },
      ticket_images: user.ticket_images || [],
      hotel_assignment: hotelAssignment,
      registered_at: user.created_at,
      last_updated: user.updated_at,
    };
  }

  async findAll(query: any) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User> = {};
    if (query.registration_status) {
      where.registration_status = query.registration_status as any;
    }
    if (query.is_room_assigned !== undefined) {
      where.is_room_assigned = query.is_room_assigned === 'true';
    }
    if (query.arrival_date) {
      where.arrival_date = new Date(query.arrival_date) as any;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      relations: ['assignedRoom', 'assignedRoom.hotel'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByPnr(pnr: string) {
    const user = await this.userRepository.findOne({
      where: { pnr },
      relations: ['assignedRoom', 'assignedRoom.hotel'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
