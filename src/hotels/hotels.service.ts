import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';
import { Room, ToiletType } from '../entities/room.entity';
import { Yatra } from '../entities/yatra.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { QueryHotelDto } from './dto/query-hotel.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { RoomAssignmentStatus, User } from '../entities/user.entity';
import { YatraRegistration } from '../entities/yatra-registration.entity';
import { In } from 'typeorm';
import { QueryAvailableHotelsDto } from './dto/query-available-hotels.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Yatra)
    private yatraRepository: Repository<Yatra>,
    @InjectRepository(YatraRegistration)
    private registrationRepository: Repository<YatraRegistration>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async findAll(query: QueryHotelDto) {
    const where: FindOptionsWhere<Hotel> = {};
    if (query.is_active !== undefined) {
      where.is_active = query.is_active;
    }
    if (query.yatra) {
      where.yatra_id = query.yatra;
    }

    // If page is not provided, return all records
    if (!query.page) {
      const hotels = await this.hotelRepository.find({
        where,
        relations: {
          rooms: true,
          yatra: true,
        },
        order: { created_at: 'DESC' },
      });

      return {
        data: hotels,
        pagination: {
          total: hotels.length,
          page: 1,
          limit: hotels.length,
          totalPages: 1,
        },
      };
    }

    const page = query.page;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

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

  async findAvailableHotels(query: QueryAvailableHotelsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.hotelRepository.createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.yatra', 'yatra')
      .where('hotel.yatra_id = :yatraId', { yatraId: query.yatra })
      .andWhere('hotel.is_active = :isActive', { isActive: query.is_active !== undefined ? query.is_active : true })
      .andWhere('hotel.available_rooms > 0')
      .andWhere('room.is_occupied = :isOccupied', { isOccupied: false });

    if (query.beds) {
      queryBuilder.andWhere('room.number_of_beds = :beds', { beds: query.beds });
    }

    const [hotels, total] = await queryBuilder
      .orderBy('hotel.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

    // Create rooms using the reusable sync method
    await this.syncRooms(savedHotel.id, createHotelDto.floors, createHotelDto.rooms);

    // Update hotel statistics
    await this.updateHotelStatistics(savedHotel.id);

    // Return complete hotel with relations
    return this.findOne(savedHotel.id);
  }

  async update(id: string, updateHotelDto: UpdateHotelDto) {
    return await this.hotelRepository.manager.transaction(async (transactionalEntityManager) => {
      const hotel = await transactionalEntityManager.findOne(Hotel, { where: { id } });

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      // Check if we're updating floors/rooms structure
      const isUpdatingStructure = updateHotelDto.floors !== undefined ||
        updateHotelDto.rooms !== undefined ||
        updateHotelDto.totalFloors !== undefined;

      if (isUpdatingStructure) {
        // Verify no rooms are occupied before allowing structure changes
        const occupiedRoomsCount = await transactionalEntityManager.count(Room, {
          where: { hotel_id: id, is_occupied: true }
        });

        if (occupiedRoomsCount > 0) {
          throw new BadRequestException(
            `Cannot update hotel structure: ${occupiedRoomsCount} room(s) are currently occupied. ` +
            'Please free all rooms before updating the hotel structure.'
          );
        }

        // Delete existing rooms
        await transactionalEntityManager.delete(Room, { hotel_id: id });

        // Sync new rooms
        await this.syncRooms(id, updateHotelDto.floors, updateHotelDto.rooms, transactionalEntityManager);
      }

      // Map update data for other fields
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

      // Update floors-related fields if provided or if structure changed
      if (updateHotelDto.floors !== undefined) {
        updateData.floors = updateHotelDto.floors as any;
        updateData.total_floors = updateHotelDto.totalFloors || updateHotelDto.floors.length;
      } else if (updateHotelDto.totalFloors !== undefined) {
        updateData.total_floors = updateHotelDto.totalFloors;
      }

      if (Object.keys(updateData).length > 0) {
        await transactionalEntityManager.update(Hotel, id, updateData);
      }

      // Update statistics (especially if structure changed)
      await this.updateHotelStatistics(id, transactionalEntityManager);

      // Return complete hotel with relations
      const updatedHotel = await transactionalEntityManager.findOne(Hotel, {
        where: { id },
        relations: {
          rooms: true,
          yatra: true,
        },
      });

      if (!updatedHotel) {
        throw new NotFoundException('Hotel not found after update');
      }

      return updatedHotel;
    });
  }

  async remove(id: string) {
    const hotel = await this.hotelRepository.findOne({ where: { id } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    await this.hotelRepository.remove(hotel);
    return { message: 'Hotel deleted successfully' };
  }

  private async syncRooms(hotelId: string, floors?: any[], rooms?: any[], entityManager?: any) {
    const manager = entityManager || this.roomRepository.manager;
    // Create rooms
    const roomsToCreate: Partial<Room>[] = [];

    // Map rooms from flat array
    const roomsMap = new Map();
    if (rooms && Array.isArray(rooms)) {
      rooms.forEach((room) => {
        if (room.roomNumber) {
          roomsMap.set(room.roomNumber.toString(), {
            roomNumber: room.roomNumber.toString(),
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
    if (floors && Array.isArray(floors)) {
      floors.forEach((floor) => {
        if (floor.roomNumbers && Array.isArray(floor.roomNumbers)) {
          floor.roomNumbers.forEach((roomNumber: string, index: number) => {
            const roomNumStr = roomNumber.toString();
            let roomDetails = roomsMap.get(roomNumStr);

            if (!roomDetails && floor.rooms && floor.rooms[index]) {
              const floorRoom = floor.rooms[index];
              roomDetails = {
                roomNumber: roomNumStr,
                floor: floor.floorNumber,
                toiletType: floorRoom.toiletType || 'western',
                numberOfBeds: floorRoom.numberOfBeds || 1,
                chargePerDay: floorRoom.chargePerDay || 0,
                isOccupied: false,
              };
            }

            if (!roomDetails) {
              roomDetails = {
                roomNumber: roomNumStr,
                floor: floor.floorNumber,
                toiletType: 'western',
                numberOfBeds: 1,
                chargePerDay: 0,
                isOccupied: false,
              };
            }

            roomsToCreate.push({
              hotel_id: hotelId,
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
    if (roomsToCreate.length === 0 && rooms && Array.isArray(rooms)) {
      rooms.forEach((room) => {
        if (room.roomNumber) {
          roomsToCreate.push({
            hotel_id: hotelId,
            room_number: room.roomNumber.toString(),
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
      // Using .insert() for better performance as we know these are new records
      // and we don't need to return the inserted objects here.
      await manager.insert(Room, roomsToCreate);
    }
  }

  async assignRoom(dto: AssignRoomDto) {
    // 1. Find Registration
    const registration = await this.registrationRepository.findOne({
      where: { id: dto.registrationId },
      relations: { user: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (!registration.user) {
      throw new NotFoundException('User associated with registration not found');
    }

    // 2. Release all previously assigned rooms for this user
    const previousRooms = await this.roomRepository.find({
      where: { assigned_to_user_id: registration.user_id },
    });

    if (previousRooms.length > 0) {
      await this.roomRepository.update(
        { assigned_to_user_id: registration.user_id },
        { is_occupied: false, assigned_to_user_id: null },
      );

      // Update hotel stats for previously affected hotels
      const previousHotelIds = [...new Set(previousRooms.map((r) => r.hotel_id))];
      for (const hotelId of previousHotelIds) {
        await this.updateHotelStatistics(hotelId);
      }
    }

    // 3. Validate all incoming rooms before assigning
    for (const assignment of dto.assignments) {
      const room = await this.roomRepository.findOne({
        where: {
          hotel_id: assignment.hotelId,
          floor: assignment.floor,
          room_number: assignment.roomNumber,
        },
      });

      if (!room) {
        throw new NotFoundException(
          `Room ${assignment.roomNumber} on floor ${assignment.floor} not found in hotel ${assignment.hotelId}`,
        );
      }

      if (room.is_occupied && room.assigned_to_user_id !== registration.user_id) {
        throw new BadRequestException(
          `Room ${assignment.roomNumber} on floor ${assignment.floor} is already occupied by another user`,
        );
      }
    }

    // 4. Assign new rooms
    const assignedRoomIds: string[] = [];

    for (const assignment of dto.assignments) {
      const room = await this.roomRepository.findOne({
        where: {
          hotel_id: assignment.hotelId,
          floor: assignment.floor,
          room_number: assignment.roomNumber,
        },
      });

      if (room) {
        room.is_occupied = true;
        room.assigned_to_user_id = registration.user_id;
        await this.roomRepository.save(room);
        assignedRoomIds.push(room.id);
      }
    }

    // 5. Update hotel stats for newly assigned hotels
    const newHotelIds = [...new Set(dto.assignments.map((a) => a.hotelId))];
    for (const hotelId of newHotelIds) {
      await this.updateHotelStatistics(hotelId);
    }

    // 6. Update user record
    await this.userRepository.update(registration.user_id, {
      is_room_assigned: assignedRoomIds.length > 0,
      assigned_room_id: assignedRoomIds.length > 0 ? assignedRoomIds[0] : null,
      room_assignment_status: assignedRoomIds.length > 0 ? RoomAssignmentStatus.DRAFT : null,
    });

    return {
      message: 'Room assignments updated successfully',
      assignedRoomsCount: assignedRoomIds.length,
      registrationId: registration.id,
      userId: registration.user_id,
    };
  }

  async removeAssignment(registrationId: string) {
    const registration = await this.registrationRepository.findOne({
      where: { id: registrationId },
      relations: { user: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (!registration.user) {
      throw new NotFoundException('User associated with registration not found');
    }

    // Find all rooms assigned to this user
    const assignedRooms = await this.roomRepository.find({
      where: { assigned_to_user_id: registration.user_id },
    });

    if (assignedRooms.length > 0) {
      // Release all rooms
      await this.roomRepository.update(
        { assigned_to_user_id: registration.user_id },
        { is_occupied: false, assigned_to_user_id: null }
      );

      // Update hotel stats for affected hotels
      const hotelIds = [...new Set(assignedRooms.map(r => r.hotel_id))];
      for (const hotelId of hotelIds) {
        await this.updateHotelStatistics(hotelId);
      }
    }

    // Update user status
    await this.userRepository.update(registration.user_id, {
      is_room_assigned: false,
      assigned_room_id: null,
      room_assignment_status: null,
    });

    return {
      message: 'Room assignment removed successfully',
      releasedRoomsCount: assignedRooms.length,
    };
  }

  async updateAssignment(dto: AssignRoomDto) {
    // First remove existing assignment
    await this.removeAssignment(dto.registrationId);

    // Then assign new rooms
    return this.assignRoom(dto);
  }

  async finalizeAssignments(yatraId: string) {
    // Check if Yatra exists
    const yatra = await this.yatraRepository.findOne({ where: { id: yatraId } });
    if (!yatra) {
      throw new NotFoundException('Yatra not found');
    }

    // Find all users with DRAFT status who have rooms in hotels belonging to this Yatra
    // We can do this by finding users with DRAFT status and filtering, 
    // or by finding hotels -> rooms -> users.
    // Since `User` has `registration_status` but `room_assignment_status` is new.

    // Update query:
    // UPDATE users SET room_assignment_status = 'confirmed' 
    // WHERE room_assignment_status = 'draft' 
    // AND id IN (SELECT user_id FROM yatra_registrations WHERE yatra_id = :yatraId)

    // Using QueryBuilder or plain repository update with finding IDs first.
    // Let's find valid users first to be safe.

    // Find users registered for this Yatra who are in DRAFT status
    const usersToConfirm = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.yatraRegistrations', 'registration')
      .where('registration.yatra_id = :yatraId', { yatraId })
      .andWhere('user.room_assignment_status = :status', { status: RoomAssignmentStatus.DRAFT })
      .getMany();

    if (usersToConfirm.length === 0) {
      return {
        message: 'No draft assignments found to finalize',
        count: 0
      };
    }

    const userIds = usersToConfirm.map(u => u.id);

    await this.userRepository.update(
      { id: In(userIds) },
      { room_assignment_status: RoomAssignmentStatus.CONFIRMED }
    );

    return {
      message: 'All draft assignments finalized',
      count: userIds.length,
      yatraId
    };
  }

  private async updateHotelStatistics(hotelId: string, entityManager?: any) {
    const manager = entityManager || this.hotelRepository.manager;

    const stats = await manager.createQueryBuilder(Room, 'room')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN room.is_occupied = 1 THEN 1 ELSE 0 END)', 'occupied')
      .where('room.hotel_id = :hotelId', { hotelId })
      .getRawOne();

    const totalRooms = parseInt(stats.total) || 0;
    const occupiedRooms = parseInt(stats.occupied) || 0;
    const availableRooms = totalRooms - occupiedRooms;

    await manager.update(Hotel, hotelId, {
      total_rooms: totalRooms,
      occupied_rooms: occupiedRooms,
      available_rooms: availableRooms,
    });
  }

  /**
   * Generate a unique login ID in the format HTL-XXXX.
   * Finds the highest existing numeric suffix and increments by 1.
   */
  private async generateLoginId(): Promise<string> {
    const hotels = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select('hotel.login_id', 'login_id')
      .where('hotel.login_id IS NOT NULL')
      .getRawMany();

    let maxNum = 0;
    for (const row of hotels) {
      const match = (row.login_id as string).match(/^HTL-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `HTL-${String(maxNum + 1).padStart(4, '0')}`;
  }

  /**
   * Generate a cryptographically random password using a safe character set.
   */
  private generateRandomPassword(length = 12): string {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&!';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Generate (or regenerate) login credentials for a hotel.
   * - login_id is assigned once (HTL-XXXX) and never changes.
   * - A new password is generated each time this is called.
   * - The password is stored hashed in the DB via the entity hook.
   * - The plain-text password is returned ONLY in this response.
   */
  async generateCredentials(hotelId: string) {
    const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // Reuse existing login_id; only assign a new one if not yet set
    const loginId = hotel.login_id ?? (await this.generateLoginId());

    // Generate a fresh plain-text password
    const plainPassword = this.generateRandomPassword(12);

    // Set fields — entity @BeforeInsert/@BeforeUpdate hook will bcrypt-hash the password
    hotel.login_id = loginId;
    hotel.password_hash = plainPassword;

    await this.hotelRepository.save(hotel);

    return {
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      login_id: loginId,
      password: plainPassword,
    };
  }

  /**
   * Get all room allotment data for a specific hotel.
   * Includes registration ID, PNR, number of travellers, name, and room details.
   */
  async getRoomAllottedData(hotelId: string) {
    const hotel = await this.hotelRepository.findOne({
      where: { id: hotelId },
      select: ['id', 'yatra_id']
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const rooms = await this.roomRepository.find({
      where: { hotel_id: hotelId, is_occupied: true },
      relations: {
        assignedUser: {
          yatraRegistrations: true
        }
      }
    });

    // Group rooms by user ID
    const groupedData = new Map<string, any>();

    for (const room of rooms) {
      const userId = room.assigned_to_user_id;
      if (!userId) continue;

      if (!groupedData.has(userId)) {
        // Find the specific registration for this hotel's yatra
        const registration = room.assignedUser?.yatraRegistrations?.find(
          reg => reg.yatra_id === hotel.yatra_id
        );

        groupedData.set(userId, {
          registration_id: registration?.id || null,
          pnr: room.assignedUser?.pnr || registration?.pnr || null,
          number_of_traveller: room.assignedUser?.number_of_persons || registration?.number_of_persons || 0,
          name: room.assignedUser?.name || registration?.name || null,
          assigned_rooms: []
        });
      }

      const userData = groupedData.get(userId);
      userData.assigned_rooms.push({
        room_number: room.room_number,
        floor: room.floor
      });
    }

    return Array.from(groupedData.values());
  }
}
