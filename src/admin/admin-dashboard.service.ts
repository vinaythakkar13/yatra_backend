import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../entities/user.entity';
import { Gender } from '../enums/gender.enum';
import { YatraRegistration, RegistrationStatus, DocumentStatus, CheckInStatus } from '../entities/yatra-registration.entity';
import { Person } from '../entities/person.entity';
import { Hotel } from '../entities/hotel.entity';
import { Room } from '../entities/room.entity';
import { UserStatusQueryDto, UserStatusFilter } from './dto/user-status-query.dto';


@Injectable()
export class AdminDashboardService {
    constructor(
        @InjectRepository(YatraRegistration)
        private registrationRepository: Repository<YatraRegistration>,
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
        @InjectRepository(Hotel)
        private hotelRepository: Repository<Hotel>,
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
    ) { }

    async getUserStatusData(query: UserStatusQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const qb = this.registrationRepository.createQueryBuilder('registration')
            .leftJoinAndSelect('registration.user', 'user')
            .leftJoinAndSelect('user.assignedRooms', 'assignedRoom')
            .leftJoinAndSelect('assignedRoom.hotel', 'hotel');

        // Apply filters
        if (query.yatraId) {
            qb.andWhere('registration.yatra_id = :yatraId', { yatraId: query.yatraId });
        }

        // Only include non-cancelled registrations and only those with room assignments
        qb.andWhere('registration.status != :cancelledStatus', { cancelledStatus: RegistrationStatus.CANCELLED });
        qb.andWhere('user.is_room_assigned = :isRoomAssigned', { isRoomAssigned: true });

        if (query.hotelId && query.hotelId !== 'all') {
            qb.andWhere('assignedRoom.hotel_id = :hotelId', { hotelId: query.hotelId });
        }

        if (query.status && query.status !== UserStatusFilter.ALL) {
            if (query.status === UserStatusFilter.ACQUIRED) {
                qb.andWhere('registration.check_in_status IN (:...acquiredStatuses)', { 
                    acquiredStatuses: [CheckInStatus.CHECKED_IN, CheckInStatus.CHECKED_OUT] 
                });
            } else if (query.status === UserStatusFilter.NOT_ACQUIRED) {
                qb.andWhere('registration.check_in_status = :notAcquiredStatus', { 
                    notAcquiredStatus: CheckInStatus.NOT_CHECKED_IN 
                });
            }
        }

        if (query.search) {
            qb.andWhere('(registration.pnr LIKE :search OR registration.name LIKE :search OR registration.whatsapp_number LIKE :search OR hotel.name LIKE :search)', { search: `%${query.search}%` });
        }

        const [registrations, total] = await qb
            .skip(skip)
            .take(limit)
            .orderBy('registration.created_at', 'DESC')
            .getManyAndCount();

        const formattedData = registrations.map(reg => {
            const assignedRooms = reg.user?.assignedRooms || [];
            const hotelName = assignedRooms.length > 0 && assignedRooms[0].hotel ? assignedRooms[0].hotel.name : null;
            
            // The phrasing required: pending, checked in, checked out
            let displayStatus = 'pending';
            if (reg.check_in_status === CheckInStatus.CHECKED_IN) {
                displayStatus = 'checked in';
            } else if (reg.check_in_status === CheckInStatus.CHECKED_OUT) {
                displayStatus = 'checked out';
            }

            return {
                id: reg.id,
                userId: reg.user_id,
                pnr: reg.pnr,
                name: reg.name,
                whatsappNumber: reg.whatsapp_number,
                numberOfPersons: reg.number_of_persons,
                hotelName: hotelName,
                status: displayStatus,
                roomAssigned: reg.user?.is_room_assigned || false,
                assignedRooms: assignedRooms.map(room => ({
                    roomName: room.room_number,
                    floorName: room.floor
                }))
            };
        });

        // Statistics calculation (using the same base filters)
        const statsQb = this.registrationRepository.createQueryBuilder('registration')
            .leftJoin('registration.user', 'user')
            .leftJoin('user.assignedRooms', 'assignedRoom')
            .leftJoin('assignedRoom.hotel', 'hotel');

        if (query.yatraId) {
            statsQb.andWhere('registration.yatra_id = :yatraId', { yatraId: query.yatraId });
        }
        statsQb.andWhere('registration.status != :cancelledStatus', { cancelledStatus: RegistrationStatus.CANCELLED });
        
        if (query.search) {
            statsQb.andWhere('(registration.pnr LIKE :search OR registration.name LIKE :search OR registration.whatsapp_number LIKE :search OR hotel.name LIKE :search)', { search: `%${query.search}%` });
        }

        // Count for all registrations in the Yatra (for pendingAllotment context)
        const allInYatraQb = statsQb.clone();
        
        // Count allotted vs pending allotment
        const allottedCount = await allInYatraQb.clone().andWhere('user.is_room_assigned = :isAssigned', { isAssigned: true }).getCount();
        const pendingAllotmentCount = await allInYatraQb.clone().andWhere('user.is_room_assigned = :isAssigned', { isAssigned: false }).getCount();

        // Count acquired / not acquired ONLY for those who have a room assigned
        const assignedOnlyQb = statsQb.clone().andWhere('user.is_room_assigned = :isAssigned', { isAssigned: true });
        
        const acquiredCount = await assignedOnlyQb.clone()
            .andWhere('registration.check_in_status IN (:...acquiredStatuses)', { 
                acquiredStatuses: [CheckInStatus.CHECKED_IN, CheckInStatus.CHECKED_OUT] 
            }).getCount();

        const notAcquiredCount = await assignedOnlyQb.clone()
            .andWhere('registration.check_in_status = :notAcquiredStatus', { 
                notAcquiredStatus: CheckInStatus.NOT_CHECKED_IN 
            }).getCount();

        return {
            statistics: {
                acquired: acquiredCount,
                notAcquired: notAcquiredCount,
                allotted: allottedCount,
                pendingAllotment: pendingAllotmentCount,
                total: allottedCount // Total represents the scope of the list (those assigned)
            },
            data: formattedData,
            pagination: {
                total, // Here total is also filtered by is_room_assigned true in the main qb
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async getDashboardData(yatraId: string) {
        try {
            const [stats, registrationAnalytics, hotels] = await Promise.all([
                this.getStats(yatraId),
                this.getRegistrationAnalytics(yatraId),
                this.getHotelData(yatraId),
            ]);

            return {
                stats,
                registrationsAnalytics: registrationAnalytics,
                hotelAnalytics: hotels,
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                stats: null,
                registrationsAnalytics: null,
                hotelAnalytics: [],
            };
        }
    }

    private async getStats(yatraId: string) {
        const registrations = await this.registrationRepository.find({
            where: { yatra_id: yatraId },
            relations: ['user'], // Added relation to user for allotment checking
        });

        const activeRegistrations = registrations.filter(r => r.status !== RegistrationStatus.CANCELLED);
        const cancelledRegistrations = registrations.filter(r => r.status === RegistrationStatus.CANCELLED);
        const approvedRegistrations = registrations.filter(r => r.status === RegistrationStatus.APPROVED);
        const pendingRegistrations = registrations.filter(r => r.status === RegistrationStatus.PENDING);

        const totalPeople = activeRegistrations.reduce((sum, r) => sum + r.number_of_persons, 0);

        // Allotted registrations count users who have a room assigned
        const allottedRegistrations = activeRegistrations.filter(r => r.user && r.user.is_room_assigned).length;

        // Pending allotment counts active registrations that do not have a room assigned
        const pendingAllotmentRegistrations = activeRegistrations.filter(r => !r.user || !r.user.is_room_assigned);
        const pendingAllotment = pendingAllotmentRegistrations.length;
        const pendingPeoplestobealloted = pendingAllotmentRegistrations.reduce((sum, r) => sum + r.number_of_persons, 0);

        // Hotels data for available rooms/beds
        const hotels = await this.hotelRepository.find({
            where: { yatra_id: yatraId, is_active: true },
        });

        const availableRooms = hotels.reduce((sum, h) => sum + (h.available_rooms || 0), 0);

        const rooms = await this.roomRepository.find({
            where: { hotel: { yatra_id: yatraId }, is_occupied: false },
        });
        const availableBeds = rooms.reduce((sum, r) => sum + (r.number_of_beds || 0), 0);

        return {
            totalRegistrations: activeRegistrations.length,
            totalPeople,
            allottedRegistrations,
            pendingAllotment,
            pendingPeoplestobealloted,
            cancelledRegistrations: cancelledRegistrations.length,
            availableRooms,
            availableBeds,
        };
    }

    private async getRegistrationAnalytics(yatraId: string) {
        const activeRegistrations = await this.registrationRepository.find({
            where: { yatra_id: yatraId, status: Not(RegistrationStatus.CANCELLED) },
            relations: ['persons'],
        });

        // Granular grouping by State and City
        const stateGroups: Record<string, Record<string, any>> = {};

        // Aggregate for overall yatra stats (keeping existing top-level fields)
        const allPersons = activeRegistrations.flatMap(r => r.persons || []);

        activeRegistrations.forEach(reg => {
            const stateName = reg.boarding_state || 'Unknown';
            const cityName = reg.boarding_city || 'Unknown';

            if (!stateGroups[stateName]) stateGroups[stateName] = {};
            if (!stateGroups[stateName][cityName]) {
                stateGroups[stateName][cityName] = {
                    city: cityName,
                    totalCount: 0,
                    registrationCount: 0,
                    gender: { male: 0, female: 0 },
                    ageRanges: { "0-20": 0, "21-40": 0, "41-60": 0, "61+": 0 },
                    handicappedCount: 0,
                };
            }

            const cityStats = stateGroups[stateName][cityName];
            cityStats.registrationCount++;
            const persons = reg.persons || [];

            persons.forEach(person => {
                cityStats.totalCount++;

                // City-level Gender
                if (person.gender === Gender.MALE) cityStats.gender.male++;
                else if (person.gender === Gender.FEMALE) cityStats.gender.female++;

                // City-level Age
                const age = person.age || 0;
                if (age <= 20) cityStats.ageRanges["0-20"]++;
                else if (age <= 40) cityStats.ageRanges["21-40"]++;
                else if (age <= 60) cityStats.ageRanges["41-60"]++;
                else cityStats.ageRanges["61+"]++;

                // City-level Handicap
                if (person.is_handicapped) cityStats.handicappedCount++;
            });
        });

        const stateData = Object.entries(stateGroups).map(([state, citiesMap]) => {
            const cities = Object.values(citiesMap);
            const totalCount = cities.reduce((sum, c) => sum + c.totalCount, 0);
            const totalRegistrations = cities.reduce((sum, c) => sum + c.registrationCount, 0);
            return {
                state,
                totalCount,
                totalRegistrations,
                cities,
            };
        });

        // Top-level Gender Data (for the whole yatra)
        const genderCounts = { Male: 0, Female: 0, Other: 0 };
        allPersons.forEach(p => {
            if (p.gender === Gender.MALE) genderCounts.Male++;
            else if (p.gender === Gender.FEMALE) genderCounts.Female++;
            else genderCounts.Other++;
        });
        const genderData = [
            { name: 'Male', value: genderCounts.Male },
            { name: 'Female', value: genderCounts.Female },
        ];

        // Top-level Age Data (for the whole yatra)
        const ageData = [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61+', count: 0 },
        ];
        allPersons.forEach(p => {
            if (p.age <= 20) ageData[0].count++;
            else if (p.age <= 40) ageData[1].count++;
            else if (p.age <= 60) ageData[2].count++;
            else ageData[3].count++;
        });

        const handicapCount = allPersons.filter(p => p.is_handicapped).length;

        return {
            stateData,
            genderData,
            ageData,
            handicapCount,
        };
    }

    private async getHotelData(yatraId: string) {
        const hotels = await this.hotelRepository.find({
            where: { yatra_id: yatraId, is_active: true },
            relations: ['rooms'],
        });

        return hotels.map(h => {
            const totalBeds = h.rooms.reduce((sum, r) => sum + (r.number_of_beds || 0), 0);
            const availableBeds = h.rooms
                .filter(r => !r.is_occupied)
                .reduce((sum, r) => sum + (r.number_of_beds || 0), 0);

            return {
                name: h.name,
                totalRooms: h.total_rooms,
                availableRooms: h.available_rooms,
                totalBeds,
                availableBeds,
            };
        });
    }
}
