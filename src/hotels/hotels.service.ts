import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';
import { Room, ToiletType } from '../entities/room.entity';
import { Yatra } from '../entities/yatra.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { QueryHotelDto } from './dto/query-hotel.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Yatra)
    private yatraRepository: Repository<Yatra>,
  ) { }

  async findAll(query: QueryHotelDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Hotel> = {};
    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }
    if (query.yatra) {
      where.yatra_id = query.yatra;
    }

    const [hotels, total] = await this.hotelRepository.findAndCount({
      where,
      relations: {
        rooms: true,
        yatra: true,
      },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: hotels,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: {
        rooms: true,
        yatra: true,
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }

  async create(createHotelDto: CreateHotelDto) {
    // Verify yatra exists
    const yatraExists = await this.yatraRepository.findOne({
      where: { id: createHotelDto.yatra },
    });

    if (!yatraExists) {
      throw new NotFoundException('Yatra not found');
    }

    // Prepare hotel data (support both camelCase and snake_case)
    const hotelData: any = {
      yatra_id: createHotelDto.yatra,
      name: createHotelDto.name,
      address: createHotelDto.address,
      map_link: createHotelDto.mapLink,
      distance_from_bhavan: createHotelDto.distanceFromBhavan,
      hotel_type: createHotelDto.hotelType,
      manager_name: createHotelDto.managerName,
      manager_contact: createHotelDto.managerContact,
      visiting_card_image: createHotelDto.visitingCardImage,
      number_of_days: createHotelDto.numberOfDays,
      start_date: createHotelDto.startDate ? new Date(createHotelDto.startDate) : null,
      end_date: createHotelDto.endDate ? new Date(createHotelDto.endDate) : null,
      check_in_time: createHotelDto.checkInTime,
      check_out_time: createHotelDto.checkOutTime,
      has_elevator: createHotelDto.hasElevator !== undefined ? createHotelDto.hasElevator : false,
      total_floors: createHotelDto.totalFloors || (createHotelDto.floors ? createHotelDto.floors.length : 0),
      floors: createHotelDto.floors || [],
      advance_paid_amount: createHotelDto.advancePaidAmount !== undefined ? createHotelDto.advancePaidAmount : 0,
      full_payment_paid: createHotelDto.fullPaymentPaid !== undefined ? createHotelDto.fullPaymentPaid : false,
    };

    const hotel = this.hotelRepository.create(hotelData);
    const savedResult = await this.hotelRepository.save(hotel);
    const savedHotel = Array.isArray(savedResult) ? savedResult[0] : savedResult;

    if (!savedHotel || !savedHotel.id) {
      throw new BadRequestException('Failed to create hotel');
    }

    // Create rooms
    const roomsToCreate: Partial<Room>[] = [];

    // Map rooms from flat array
    const roomsMap = new Map();
    if (createHotelDto.rooms && Array.isArray(createHotelDto.rooms)) {
      createHotelDto.rooms.forEach((room) => {
        if (room.roomNumber) {
          roomsMap.set(room.roomNumber, {
            roomNumber: room.roomNumber,
            floor: room.floor,
            toiletType: room.toiletType,
            numberOfBeds: room.numberOfBeds,
            chargePerDay: room.chargePerDay,
            isOccupied: room.isOccupied || false,
          });
        }
      });
    }

    // Process floors structure
    if (createHotelDto.floors && Array.isArray(createHotelDto.floors)) {
      createHotelDto.floors.forEach((floor) => {
        if (floor.roomNumbers && Array.isArray(floor.roomNumbers)) {
          floor.roomNumbers.forEach((roomNumber, index) => {
            let roomDetails = roomsMap.get(roomNumber);

            if (!roomDetails && floor.rooms && floor.rooms[index]) {
              const floorRoom = floor.rooms[index];
              roomDetails = {
                roomNumber: roomNumber,
                floor: floor.floorNumber,
                toiletType: floorRoom.toiletType || 'western',
                numberOfBeds: floorRoom.numberOfBeds || 1,
                chargePerDay: floorRoom.chargePerDay || 0,
                isOccupied: false,
              };
            }

            if (!roomDetails) {
              roomDetails = {
                roomNumber: roomNumber,
                floor: floor.floorNumber,
                toiletType: 'western',
                numberOfBeds: 1,
                chargePerDay: 0,
                isOccupied: false,
              };
            }

            roomsToCreate.push({
              hotel_id: savedHotel.id,
              room_number: roomDetails.roomNumber,
              floor: roomDetails.floor ? roomDetails.floor.toString() : floor.floorNumber.toString(),
              toilet_type: (roomDetails.toiletType === 'indian' ? ToiletType.INDIAN : ToiletType.WESTERN) as any,
              number_of_beds: roomDetails.numberOfBeds || 1,
              charge_per_day: roomDetails.chargePerDay || 0,
              is_occupied: roomDetails.isOccupied || false,
            });
          });
        }
      });
    }

    // If no floors structure, use flat rooms array
    if (roomsToCreate.length === 0 && createHotelDto.rooms && Array.isArray(createHotelDto.rooms)) {
      createHotelDto.rooms.forEach((room) => {
        if (room.roomNumber) {
          roomsToCreate.push({
            hotel_id: savedHotel.id,
            room_number: room.roomNumber,
            floor: room.floor ? room.floor.toString() : '1',
            toilet_type: (room.toiletType === 'indian' ? ToiletType.INDIAN : ToiletType.WESTERN) as any,
            number_of_beds: room.numberOfBeds || 1,
            charge_per_day: room.chargePerDay || 0,
            is_occupied: room.isOccupied || false,
          });
        }
      });
    }

    // Bulk create rooms
    if (roomsToCreate.length > 0) {
      const roomEntities = this.roomRepository.create(roomsToCreate);
      await this.roomRepository.save(roomEntities);
    }

    // Update hotel statistics
    await this.updateHotelStatistics(savedHotel.id);

    // Return complete hotel with relations
    return this.findOne(savedHotel.id);
  }

  async update(id: string, updateHotelDto: UpdateHotelDto) {
    const hotel = await this.hotelRepository.findOne({ where: { id } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // Map update data
    const updateData: any = {};
    if (updateHotelDto.name !== undefined) updateData.name = updateHotelDto.name;
    if (updateHotelDto.address !== undefined) updateData.address = updateHotelDto.address;
    if (updateHotelDto.mapLink !== undefined) updateData.map_link = updateHotelDto.mapLink;
    if (updateHotelDto.distanceFromBhavan !== undefined) updateData.distance_from_bhavan = updateHotelDto.distanceFromBhavan;
    if (updateHotelDto.hotelType !== undefined) updateData.hotel_type = updateHotelDto.hotelType;
    if (updateHotelDto.managerName !== undefined) updateData.manager_name = updateHotelDto.managerName;
    if (updateHotelDto.managerContact !== undefined) updateData.manager_contact = updateHotelDto.managerContact;
    if (updateHotelDto.visitingCardImage !== undefined) updateData.visiting_card_image = updateHotelDto.visitingCardImage;
    if (updateHotelDto.numberOfDays !== undefined) updateData.number_of_days = updateHotelDto.numberOfDays;
    if (updateHotelDto.startDate !== undefined) updateData.start_date = new Date(updateHotelDto.startDate);
    if (updateHotelDto.endDate !== undefined) updateData.end_date = new Date(updateHotelDto.endDate);
    if (updateHotelDto.checkInTime !== undefined) updateData.check_in_time = updateHotelDto.checkInTime;
    if (updateHotelDto.checkOutTime !== undefined) updateData.check_out_time = updateHotelDto.checkOutTime;
    if (updateHotelDto.hasElevator !== undefined) updateData.has_elevator = updateHotelDto.hasElevator;
    if (updateHotelDto.is_active !== undefined) updateData.is_active = updateHotelDto.is_active;
    if (updateHotelDto.advancePaidAmount !== undefined) updateData.advance_paid_amount = updateHotelDto.advancePaidAmount;
    if (updateHotelDto.fullPaymentPaid !== undefined) updateData.full_payment_paid = updateHotelDto.fullPaymentPaid;

    await this.hotelRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const hotel = await this.hotelRepository.findOne({ where: { id } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    await this.hotelRepository.remove(hotel);
    return { message: 'Hotel deleted successfully' };
  }

  private async updateHotelStatistics(hotelId: string) {
    const [totalRooms, occupiedRooms] = await Promise.all([
      this.roomRepository.count({ where: { hotel_id: hotelId } }),
      this.roomRepository.count({ where: { hotel_id: hotelId, is_occupied: true } }),
    ]);

    const availableRooms = totalRooms - occupiedRooms;

    await this.hotelRepository.update(hotelId, {
      total_rooms: totalRooms,
      occupied_rooms: occupiedRooms,
      available_rooms: availableRooms,
    });
  }
}
