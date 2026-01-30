import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource, Like, Or, Not, IsNull } from 'typeorm';
import { YatraRegistration, RegistrationStatus } from '../entities/yatra-registration.entity';
import { Person } from '../entities/person.entity';
import { User } from '../entities/user.entity';
import { Yatra } from '../entities/yatra.entity';
import { Room } from '../entities/room.entity';
import { Hotel } from '../entities/hotel.entity';
import { RegistrationLog, RegistrationAction, ChangedByType } from '../entities/registration-log.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { CancelRegistrationDto } from './dto/cancel-registration.dto';
import { ApproveRegistrationDto, RejectRegistrationDto } from './dto/approve-reject-registration.dto';
import { QueryRegistrationDto, RegistrationFilterMode } from './dto/query-registration.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { Gender } from '../entities/user.entity';
import { TicketType } from './enums/ticket-type.enum';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(YatraRegistration)
    private registrationRepository: Repository<YatraRegistration>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Yatra)
    private yatraRepository: Repository<Yatra>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(RegistrationLog)
    private logRepository: Repository<RegistrationLog>,
    private dataSource: DataSource,
  ) { }

  async create(createDto: CreateRegistrationDto, userId?: string, ipAddress?: string, userAgent?: string) {
    // Normalize PNR to uppercase
    createDto.pnr = createDto.pnr.toUpperCase();

    // Verify yatra exists
    const yatra = await this.yatraRepository.findOne({ where: { id: createDto.yatraId } });
    if (!yatra) {
      throw new NotFoundException('Yatra not found');
    }

    // Registration date validation removed - allowing registrations at any time

    // Check if PNR already registered for this yatra (and is not cancelled)
    const existingRegistration = await this.registrationRepository.findOne({
      where: {
        pnr: createDto.pnr,
        yatra_id: createDto.yatraId,
        status: Not(RegistrationStatus.CANCELLED)
      },
    });
    if (existingRegistration) {
      throw new BadRequestException('PNR already registered for this yatra and is currently active');
    }

    // Find or create user
    let user = await this.userRepository.findOne({ where: { pnr: createDto.pnr } });
    if (!user) {
      // Create user with first person's details
      const firstPerson = createDto.persons[0];
      user = this.userRepository.create({
        pnr: createDto.pnr,
        name: createDto.name,
        contact_number: createDto.whatsappNumber,
        gender: firstPerson.gender as Gender,
        age: firstPerson.age,
        number_of_persons: createDto.numberOfPersons,
        boarding_state: createDto.boardingPoint.state,
        boarding_city: createDto.boardingPoint.city,
        boarding_point: `${createDto.boardingPoint.city}, ${createDto.boardingPoint.state}`,
        arrival_date: new Date(createDto.arrivalDate),
        return_date: new Date(createDto.returnDate),
        ticket_images: createDto.ticketImages || [],
        registration_status: 'pending' as any,
      });
      user = await this.userRepository.save(user);
    } else {
      // Update user details if needed
      user.name = createDto.name;
      user.contact_number = createDto.whatsappNumber;
      user.number_of_persons = createDto.numberOfPersons;
      user.boarding_state = createDto.boardingPoint.state;
      user.boarding_city = createDto.boardingPoint.city;
      user.boarding_point = `${createDto.boardingPoint.city}, ${createDto.boardingPoint.state}`;
      user.arrival_date = new Date(createDto.arrivalDate);
      user.return_date = new Date(createDto.returnDate);
      user.ticket_images = createDto.ticketImages || [];
      user.registration_status = 'pending' as any;
      await this.userRepository.save(user);
    }

    // Create registration
    const registration = this.registrationRepository.create({
      user_id: user.id,
      yatra_id: createDto.yatraId,
      pnr: createDto.pnr,
      name: createDto.name,
      whatsapp_number: createDto.whatsappNumber,
      number_of_persons: createDto.numberOfPersons,
      boarding_city: createDto.boardingPoint.city,
      boarding_state: createDto.boardingPoint.state,
      arrival_date: new Date(createDto.arrivalDate),
      return_date: new Date(createDto.returnDate),
      ticket_images: createDto.ticketImages || [],
      ticket_type: createDto.ticketType || null,
      status: RegistrationStatus.PENDING,
    });

    const savedRegistration = await this.registrationRepository.save(registration);

    // Create persons
    const persons = createDto.persons.map((person) =>
      this.personRepository.create({
        registration_id: savedRegistration.id,
        name: person.name,
        age: person.age,
        gender: person.gender as Gender,
        is_handicapped: person.isHandicapped !== undefined ? person.isHandicapped : false,
      }),
    );
    await this.personRepository.save(persons);

    // Create audit log
    await this.createLog(
      savedRegistration.id,
      RegistrationAction.CREATED,
      userId,
      userId ? ChangedByType.ADMIN : ChangedByType.USER,
      null,
      savedRegistration,
      null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return this.findOne(savedRegistration.id);
  }

  async findAll(query: QueryRegistrationDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build base where clause
    const baseWhere: any = {};
    if (query.yatraId) {
      baseWhere.yatra_id = query.yatraId;
    }

    // Handle filterMode
    if (query.filterMode === RegistrationFilterMode.GENERAL) {
      baseWhere.status = Not(RegistrationStatus.CANCELLED);
    } else if (query.filterMode === RegistrationFilterMode.CANCELLED) {
      baseWhere.status = RegistrationStatus.CANCELLED;
    } else if (query.status) {
      // If status is explicitly provided, it overrides filterMode (or is used when filterMode is 'all')
      baseWhere.status = query.status;
    }

    if (query.pnr) {
      baseWhere.pnr = query.pnr.toUpperCase();
    }

    if (query.state) {
      baseWhere.boarding_state = query.state;
    }

    if (query.ticketType && query.ticketType !== 'all') {
      if (query.ticketType === 'Not added') {
        baseWhere.ticket_type = IsNull();
      } else {
        baseWhere.ticket_type = query.ticketType;
      }
    }

    // Handle search with OR conditions across name, PNR, and WhatsApp number
    let whereClause: any;
    if (query.search) {
      whereClause = [
        { ...baseWhere, name: Like(`%${query.search}%`) },
        { ...baseWhere, pnr: Like(`%${query.search}%`) },
        { ...baseWhere, whatsapp_number: Like(`%${query.search}%`) },
      ];
    } else {
      whereClause = baseWhere;
    }

    const [registrations, total] = await this.registrationRepository.findAndCount({
      where: whereClause,
      relations: {
        user: true,
        yatra: true,
        persons: true,
      },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: {
        user: true,
        yatra: true,
        persons: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async update(
    id: string,
    updateDto: UpdateRegistrationDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const registration = await this.findOne(id);

    // Only allow updates if status is PENDING or APPROVED (user can update approved until admin processes)
    if (registration.status === RegistrationStatus.REJECTED) {
      throw new BadRequestException('Cannot update a rejected registration');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled registration');
    }

    const oldValues = { ...registration };

    // Update registration fields
    if (updateDto.name !== undefined) registration.name = updateDto.name;
    if (updateDto.whatsappNumber !== undefined) registration.whatsapp_number = updateDto.whatsappNumber;
    if (updateDto.numberOfPersons !== undefined) registration.number_of_persons = updateDto.numberOfPersons;
    if (updateDto.boardingPoint) {
      registration.boarding_city = updateDto.boardingPoint.city || registration.boarding_city;
      registration.boarding_state = updateDto.boardingPoint.state || registration.boarding_state;
    }
    if (updateDto.arrivalDate) registration.arrival_date = new Date(updateDto.arrivalDate);
    if (updateDto.returnDate) registration.return_date = new Date(updateDto.returnDate);
    if (updateDto.ticketImages !== undefined) registration.ticket_images = updateDto.ticketImages;
    if (updateDto.ticketType !== undefined) registration.ticket_type = updateDto.ticketType;

    // If status was APPROVED, change back to PENDING after update
    if (registration.status === RegistrationStatus.APPROVED) {
      registration.status = RegistrationStatus.PENDING;
    }

    const savedRegistration = await this.registrationRepository.save(registration);

    // Update persons if provided
    if (updateDto.persons && updateDto.persons.length > 0) {
      // Delete existing persons
      await this.personRepository.delete({ registration_id: id });

      // Create new persons
      const persons = updateDto.persons.map((person) =>
        this.personRepository.create({
          registration_id: id,
          name: person.name!,
          age: person.age!,
          gender: person.gender as Gender,
          is_handicapped: person.isHandicapped !== undefined ? person.isHandicapped : false,
        }),
      );
      await this.personRepository.save(persons);
    }

    // Update user if needed
    if (registration.user_id) {
      const user = await this.userRepository.findOne({ where: { id: registration.user_id } });
      if (user) {
        if (updateDto.name !== undefined) user.name = updateDto.name;
        if (updateDto.whatsappNumber !== undefined) user.contact_number = updateDto.whatsappNumber;
        if (updateDto.numberOfPersons !== undefined) user.number_of_persons = updateDto.numberOfPersons;
        if (updateDto.boardingPoint) {
          user.boarding_state = updateDto.boardingPoint.state || user.boarding_state;
          user.boarding_city = updateDto.boardingPoint.city || user.boarding_city;
          user.boarding_point = `${user.boarding_city}, ${user.boarding_state}`;
        }
        if (updateDto.arrivalDate) user.arrival_date = new Date(updateDto.arrivalDate);
        if (updateDto.returnDate) user.return_date = new Date(updateDto.returnDate);
        if (updateDto.ticketImages !== undefined) user.ticket_images = updateDto.ticketImages;
        await this.userRepository.save(user);
      }
    }

    // Create audit log
    await this.createLog(
      id,
      RegistrationAction.UPDATED,
      userId,
      userId ? ChangedByType.ADMIN : ChangedByType.USER,
      oldValues,
      savedRegistration,
      null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return this.findOne(id);
  }

  async cancel(
    id: string,
    cancelDto: CancelRegistrationDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const registration = await this.findOne(id);

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration is already cancelled');
    }

    if (registration.status === RegistrationStatus.REJECTED) {
      throw new BadRequestException('Cannot cancel a rejected registration');
    }

    const oldValues = { ...registration };

    registration.status = RegistrationStatus.CANCELLED;
    registration.cancellation_reason = cancelDto.reason || null;
    registration.cancelled_at = new Date();

    const savedRegistration = await this.registrationRepository.save(registration);

    // Update user status
    if (registration.user_id) {
      const user = await this.userRepository.findOne({ where: { id: registration.user_id } });
      if (user) {
        user.registration_status = 'cancelled' as any;
        await this.userRepository.save(user);
      }
    }

    // Create audit log
    await this.createLog(
      id,
      RegistrationAction.CANCELLED,
      userId,
      userId ? ChangedByType.ADMIN : ChangedByType.USER,
      oldValues,
      savedRegistration,
      cancelDto.reason || 'No reason provided',
      null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return this.findOne(id);
  }

  async approve(
    id: string,
    approveDto: ApproveRegistrationDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const registration = await this.findOne(id);

    if (registration.status === RegistrationStatus.APPROVED) {
      throw new BadRequestException('Registration is already approved');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Cannot approve a cancelled registration');
    }

    const oldValues = { ...registration };

    registration.status = RegistrationStatus.APPROVED;
    registration.approved_by_admin_id = adminId;
    registration.approved_at = new Date();
    if (approveDto.comments) {
      registration.admin_comments = approveDto.comments;
    }

    const savedRegistration = await this.registrationRepository.save(registration);

    // Update user status
    if (registration.user_id) {
      const user = await this.userRepository.findOne({ where: { id: registration.user_id } });
      if (user) {
        user.registration_status = 'confirmed' as any;
        await this.userRepository.save(user);
      }
    }

    // Create audit log
    await this.createLog(
      id,
      RegistrationAction.APPROVED,
      adminId,
      ChangedByType.ADMIN,
      oldValues,
      savedRegistration,
      null,
      approveDto.comments || null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return this.findOne(id);
  }

  async reject(
    id: string,
    rejectDto: RejectRegistrationDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const registration = await this.findOne(id);

    if (registration.status === RegistrationStatus.REJECTED) {
      throw new BadRequestException('Registration is already rejected');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Cannot reject a cancelled registration');
    }

    const oldValues = { ...registration };

    registration.status = RegistrationStatus.REJECTED;
    registration.rejected_by_admin_id = adminId;
    registration.rejected_at = new Date();
    registration.rejection_reason = rejectDto.reason;
    if (rejectDto.comments) {
      registration.admin_comments = rejectDto.comments;
    }

    const savedRegistration = await this.registrationRepository.save(registration);

    // Create audit log
    await this.createLog(
      id,
      RegistrationAction.REJECTED,
      adminId,
      ChangedByType.ADMIN,
      oldValues,
      savedRegistration,
      rejectDto.reason,
      rejectDto.comments || null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return this.findOne(id);
  }

  private async createLog(
    registrationId: string,
    action: RegistrationAction,
    changedBy: string | undefined,
    changedByType: ChangedByType | undefined,
    oldValues: any,
    newValues: any,
    reason: string | null | undefined,
    comments: string | null | undefined,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Serialize objects to plain JSON to avoid circular references and TypeORM metadata
    const serializeValue = (value: any): any => {
      const seen = new WeakSet();

      const internalSerialize = (val: any, depth = 0): any => {
        if (val === null || val === undefined) return null;
        if (val instanceof Date) return val.toISOString();
        if (typeof val !== 'object') return val;

        // Prevent infinite recursion and circular references
        if (seen.has(val)) return '[Circular]';
        seen.add(val);

        // Limit depth to prevent huge objects and potential hangs
        if (depth > 3) return '[Max Depth Reached]';

        if (Array.isArray(val)) {
          return val.map(item => internalSerialize(item, depth + 1));
        }

        const plain: any = {};
        for (const key in val) {
          // Skip internal TypeORM properties and circular references
          if (key.startsWith('_') || key === 'constructor') continue;

          try {
            plain[key] = internalSerialize(val[key], depth + 1);
          } catch (e) {
            plain[key] = '[Error Serializing]';
          }
        }
        return plain;
      };

      return internalSerialize(value);
    };

    // Ensure IP address is truncated to 128 characters (database column limit)
    let sanitizedIpAddress = ipAddress ?? null;
    if (sanitizedIpAddress && sanitizedIpAddress.length > 128) {
      sanitizedIpAddress = sanitizedIpAddress.substring(0, 128);
    }

    const logData: any = {
      registration_id: registrationId,
      action,
      changed_by: changedBy ?? null,
      changed_by_type: changedByType ?? null,
      old_values: oldValues ? serializeValue(oldValues) : null,
      new_values: newValues ? serializeValue(newValues) : null,
      reason: reason ?? null,
      comments: comments ?? null,
      ip_address: sanitizedIpAddress,
      user_agent: userAgent ?? null,
    };

    const log = this.logRepository.create(logData);
    await this.logRepository.save(log);
  }

  async getByPnr(pnr: string) {
    const normalizedPnr = pnr.toUpperCase();
    // Find registration by PNR
    const registration = await this.registrationRepository.findOne({
      where: { pnr: normalizedPnr },
      relations: {
        user: {
          assignedRoom: {
            hotel: true,
          },
        },
        yatra: true,
        persons: true,
      },
      order: {
        created_at: 'DESC', // Get the most recent registration if multiple exist
      },
    });

    if (!registration) {
      throw new NotFoundException(`Registration not found for PNR: ${pnr}`);
    }

    // Build response with hotel and room information if assigned
    const response: any = {
      registration: {
        id: registration.id,
        pnr: registration.pnr,
        name: registration.name,
        whatsapp_number: registration.whatsapp_number,
        number_of_persons: registration.number_of_persons,
        boarding_city: registration.boarding_city,
        boarding_state: registration.boarding_state,
        arrival_date: registration.arrival_date,
        return_date: registration.return_date,
        ticket_images: registration.ticket_images,
        status: registration.status,
        cancellation_reason: registration.cancellation_reason,
        admin_comments: registration.admin_comments,
        rejection_reason: registration.rejection_reason,
        ticket_type: registration.ticket_type,
        created_at: registration.created_at,
        updated_at: registration.updated_at,
      },
      persons: registration.persons || [],
      yatra: registration.yatra ? {
        id: registration.yatra.id,
        name: registration.yatra.name,
        banner_image: registration.yatra.banner_image,
        description: registration.yatra.description,
        start_date: registration.yatra.start_date,
        end_date: registration.yatra.end_date,
        registration_start_date: registration.yatra.registration_start_date,
        registration_end_date: registration.yatra.registration_end_date,
        created_at: registration.yatra.created_at,
        updated_at: registration.yatra.updated_at,
      } : null,
      hotel: null,
      room: null,
    };

    // Check if user has assigned room
    if (registration.user && registration.user.assigned_room_id && registration.user.assignedRoom) {
      const room = registration.user.assignedRoom;
      const hotel = room.hotel;

      response.room = {
        id: room.id,
        room_number: room.room_number,
        floor: room.floor,
        toilet_type: room.toilet_type,
        number_of_beds: room.number_of_beds,
        charge_per_day: room.charge_per_day,
        is_occupied: room.is_occupied,
        created_at: room.created_at,
        updated_at: room.updated_at,
      };

      if (hotel) {
        response.hotel = {
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          map_link: hotel.map_link,
          distance_from_bhavan: hotel.distance_from_bhavan,
          hotel_type: hotel.hotel_type,
          manager_name: hotel.manager_name,
          manager_contact: hotel.manager_contact,
          number_of_days: hotel.number_of_days,
          start_date: hotel.start_date,
          end_date: hotel.end_date,
          check_in_time: hotel.check_in_time,
          check_out_time: hotel.check_out_time,
          has_elevator: hotel.has_elevator,
          total_floors: hotel.total_floors,
          is_active: hotel.is_active,
          created_at: hotel.created_at,
          updated_at: hotel.updated_at,
        };
      }
    }

    return response;
  }

  async updateTicketType(
    id: string,
    updateDto: UpdateTicketTypeDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Load only the registration without relations to avoid deep serialization and performance issues
    const registration = await this.registrationRepository.findOne({
      where: { id }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const oldValues = { ...registration };
    registration.ticket_type = updateDto.ticketType;

    const savedRegistration = await this.registrationRepository.save(registration);

    // Create audit log - createLog's serializeValue will handle the entities
    await this.createLog(
      id,
      RegistrationAction.UPDATED,
      userId,
      userId ? ChangedByType.ADMIN : ChangedByType.USER,
      oldValues,
      savedRegistration,
      `Ticket type updated to ${updateDto.ticketType}`,
      null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    // Reload with relations (but no logs) for the final response
    return this.findOne(id);
  }

  async getLogs(id: string) {
    const logs = await this.logRepository.find({
      where: { registration_id: id },
      order: { created_at: 'DESC' },
    });
    return logs;
  }
}
