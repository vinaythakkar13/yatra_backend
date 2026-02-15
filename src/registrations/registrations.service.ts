import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource, Like, Or, Not, IsNull } from 'typeorm';
import { YatraRegistration, RegistrationStatus, DocumentStatus } from '../entities/yatra-registration.entity';
import { Person } from '../entities/person.entity';
import { User } from '../entities/user.entity';
import { Gender } from '../enums/gender.enum';
import { Yatra } from '../entities/yatra.entity';
import { Room } from '../entities/room.entity';
import { Hotel } from '../entities/hotel.entity';
import { RegistrationLog, RegistrationAction, ChangedByType } from '../entities/registration-log.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CreateSplitRegistrationDto } from './dto/create-split-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { CancelRegistrationDto } from './dto/cancel-registration.dto';
import { ApproveRegistrationDto, RejectRegistrationDto } from './dto/approve-reject-registration.dto';
import { ApproveDocumentDto, RejectDocumentDto } from './dto/approve-reject-document.dto';
import { QueryRegistrationDto, RegistrationFilterMode } from './dto/query-registration.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketType } from './enums/ticket-type.enum';
import { generateInternalPnr } from '../utils/pnr-generator';

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

  async createSplitRegistration(createDto: CreateSplitRegistrationDto, adminId: string, ipAddress?: string, userAgent?: string) {
    // Normalize original PNR to uppercase
    createDto.originalPnr = createDto.originalPnr.toUpperCase();

    // Verify yatra exists
    const yatra = await this.yatraRepository.findOne({ where: { id: createDto.yatraId } });
    if (!yatra) {
      throw new NotFoundException('Yatra not found');
    }

    // Generate unique internal PNR
    let internalPnr: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      if (attempts >= maxAttempts) {
        throw new BadRequestException('Unable to generate unique internal PNR after multiple attempts');
      }

      internalPnr = generateInternalPnr();
      attempts++;

      // Check for collision with existing PNRs and split PNRs
      const existingPnr = await this.registrationRepository.findOne({
        where: [
          { pnr: internalPnr },
          { split_pnr: internalPnr }
        ]
      });

      if (!existingPnr) {
        break; // No collision, we can use this PNR
      }
    } while (attempts < maxAttempts);

    // Find or create user with internal PNR
    let user = await this.userRepository.findOne({ where: { pnr: internalPnr } });
    if (!user) {
      // Create user with first person's details and internal PNR
      const firstPerson = createDto.persons[0];
      user = this.userRepository.create({
        pnr: internalPnr,
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
    }

    // Create split registration
    const registration = this.registrationRepository.create({
      user_id: user.id,
      yatra_id: createDto.yatraId,
      pnr: internalPnr, // Store internal PNR in main pnr field
      split_pnr: internalPnr, // Also store in split_pnr field for identification
      original_pnr: createDto.originalPnr, // Store original PNR
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

    // Create audit log with split registration action
    await this.createLog(
      savedRegistration.id,
      RegistrationAction.SPLIT_REGISTRATION_CREATED,
      adminId,
      ChangedByType.ADMIN,
      null,
      savedRegistration,
      `Split registration created from original PNR: ${createDto.originalPnr}`,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return {
      registration: await this.findOne(savedRegistration.id),
      internalPnr,
      originalPnr: createDto.originalPnr,
    };
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

    if (query.documentStatus) {
      baseWhere.document_status = query.documentStatus;
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

    // Handle new split registration filters
    if (query.originalPnr) {
      baseWhere.original_pnr = query.originalPnr.toUpperCase();
    }

    if (query.splitPnr) {
      baseWhere.split_pnr = query.splitPnr.toUpperCase();
    }

    if (query.onlySplitRegistrations) {
      baseWhere.split_pnr = Not(IsNull());
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
        user: {
          assignedRooms: {
            hotel: true,
          },
        },
        yatra: true,
        persons: true,
      },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const sanitizedRegistrations = registrations.map(reg => this.sanitizeRegistration(reg));

    return {
      data: sanitizedRegistrations,
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
        user: {
          assignedRooms: {
            hotel: true,
          },
        },
        yatra: true,
        persons: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return this.sanitizeRegistration(registration);
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
    if (updateDto.ticketImages !== undefined) {
      registration.ticket_images = updateDto.ticketImages;
      // If documents were rejected, mark as pending again when new images are uploaded
      if (registration.document_status === DocumentStatus.REJECTED) {
        registration.document_status = DocumentStatus.PENDING;
        registration.document_rejection_reason = null;
      }
    }
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
    if (userId) {
      registration.cancelled_by_admin_id = userId;
    }

    const savedRegistration = await this.registrationRepository.save(registration);

    // Update user status
    if (registration.user_id) {
      const user = await this.userRepository.findOne({ where: { id: registration.user_id } });
      if (user) {
        user.registration_status = RegistrationStatus.CANCELLED as any;
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

  async approveDocument(
    id: string,
    approveDto: ApproveDocumentDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const registration = await this.findOne(id);

    if (registration.document_status === DocumentStatus.APPROVED) {
      throw new BadRequestException('Documents are already approved');
    }

    const oldValues = { ...registration };

    registration.document_status = DocumentStatus.APPROVED;
    registration.document_rejection_reason = null;
    if (approveDto.comments) {
      registration.admin_comments = approveDto.comments;
    }

    const savedRegistration = await this.registrationRepository.save(registration);

    // Create audit log
    await this.createLog(
      id,
      RegistrationAction.UPDATED,
      adminId,
      ChangedByType.ADMIN,
      oldValues,
      savedRegistration,
      'Documents approved',
      approveDto.comments || null,
      ipAddress ?? undefined,
      userAgent ?? undefined,
    );

    return this.findOne(id);
  }

  async rejectDocument(
    id: string,
    rejectDto: RejectDocumentDto,
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const registration = await this.findOne(id);

    if (registration.document_status === DocumentStatus.REJECTED && registration.document_rejection_reason === rejectDto.reason) {
      throw new BadRequestException('Documents are already rejected with this reason');
    }

    const oldValues = { ...registration };

    registration.document_status = DocumentStatus.REJECTED;
    registration.document_rejection_reason = rejectDto.reason;
    if (rejectDto.comments) {
      registration.admin_comments = rejectDto.comments;
    }

    // Auto-cancel registration when document is rejected
    registration.status = RegistrationStatus.CANCELLED;
    registration.cancellation_reason = `Document rejected: ${rejectDto.reason}`;
    registration.cancelled_at = new Date();
    registration.cancelled_by_admin_id = adminId;

    const savedRegistration = await this.registrationRepository.save(registration);

    // Update user status
    if (registration.user_id) {
      const user = await this.userRepository.findOne({ where: { id: registration.user_id } });
      if (user) {
        user.registration_status = RegistrationStatus.CANCELLED as any;
        await this.userRepository.save(user);
      }
    }

    // Create audit log with CANCELLED action
    await this.createLog(
      id,
      RegistrationAction.CANCELLED,
      adminId,
      ChangedByType.ADMIN,
      oldValues,
      savedRegistration,
      `Registration cancelled due to document rejection: ${rejectDto.reason}`,
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
          assignedRooms: {
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
        document_status: registration.document_status,
        document_rejection_reason: registration.document_rejection_reason,
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
      assignedRooms: [],
      hotel: null,
    };

    // Check if user has assigned rooms
    if (registration.user && registration.user.assignedRooms && registration.user.assignedRooms.length > 0) {
      const assignedRooms = registration.user.assignedRooms;
      const hotel = assignedRooms[0].hotel;

      response.assignedRooms = assignedRooms.map(room => ({
        room_number: room.room_number,
        floor: room.floor,
      }));

      if (hotel) {
        response.hotel = {
          name: hotel.name,
          address: hotel.address,
          manager_name: hotel.manager_name,
          manager_contact: hotel.manager_contact,
          map_link: hotel.map_link,
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
    try {
      console.log('updateTicketType called with:', { id, ticketType: updateDto.ticketType });

      // Load only the registration without relations to avoid deep serialization and performance issues
      const registration = await this.registrationRepository.findOne({
        where: { id }
      });

      if (!registration) {
        throw new NotFoundException('Registration not found');
      }

      console.log('Registration found, updating ticket type...');

      registration.ticket_type = updateDto.ticketType;
      const savedRegistration = await this.registrationRepository.save(registration);

      console.log('Registration saved successfully');

      return savedRegistration;
    } catch (error) {
      console.error('Error in updateTicketType:', error);
      throw error;
    }
  }

  async getLogs(id: string) {
    const logs = await this.logRepository.find({
      where: { registration_id: id },
      order: { created_at: 'DESC' },
    });
    return logs;
  }

  async getSplitCountByOriginalPnr(originalPnr: string): Promise<{ originalPnr: string; splitCount: number; splitRegistrations: any[] }> {
    const splitRegistrations = await this.registrationRepository.find({
      where: {
        original_pnr: originalPnr.toUpperCase(),
        status: Not(RegistrationStatus.CANCELLED)
      },
      relations: {
        persons: true,
        yatra: true,
      },
      order: { created_at: 'DESC' },
    });

    return {
      originalPnr: originalPnr.toUpperCase(),
      splitCount: splitRegistrations.length,
      splitRegistrations: splitRegistrations.map(reg => ({
        id: reg.id,
        splitPnr: reg.split_pnr,
        name: reg.name,
        numberOfPersons: reg.number_of_persons,
        status: reg.status,
        createdAt: reg.created_at,
        yatra: reg.yatra ? {
          id: reg.yatra.id,
          name: reg.yatra.name,
        } : null,
      })),
    };
  }
  private sanitizeRegistration(registration: YatraRegistration) {
    if (registration.user) {
      // Remove legacy assignedRoom if present to avoid confusion
      delete (registration.user as any).assignedRoom;

      // Initialize response structure
      (registration.user as any).assignedRooms = [];
      (registration.user as any).hotel = null;

      if (registration.user.assignedRooms && registration.user.assignedRooms.length > 0) {
        const assignedRooms = registration.user.assignedRooms;
        const firstRoom = assignedRooms[0];
        const hotel = firstRoom.hotel;

        // Map assigned rooms to simplified structure
        (registration.user as any).assignedRooms = assignedRooms.map(room => ({
          id: room.id,
          room_number: room.room_number,
          floor: room.floor,
        }));

        // Extract hotel details from the first room
        if (hotel) {
          (registration.user as any).hotel = {
            id: hotel.id,
            name: hotel.name,
            address: hotel.address,
            manager_name: hotel.manager_name,
            manager_contact: hotel.manager_contact,
            map_link: hotel.map_link,
          };
        }
      }
    }
    return registration;
  }
}
