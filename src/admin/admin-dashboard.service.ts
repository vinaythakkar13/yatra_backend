import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { YatraRegistration, RegistrationStatus } from '../entities/yatra-registration.entity';
import { Person } from '../entities/person.entity';
import { Hotel } from '../entities/hotel.entity';
import { Room } from '../entities/room.entity';
import { Gender } from '../entities/user.entity';

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
                hotels,
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                stats: null,
                registrationsAnalytics: null,
                hotels: [],
            };
        }
    }

    private async getStats(yatraId: string) {
        const registrations = await this.registrationRepository.find({
            where: { yatra_id: yatraId },
        });

        const activeRegistrations = registrations.filter(r => r.status !== RegistrationStatus.CANCELLED);
        const cancelledRegistrations = registrations.filter(r => r.status === RegistrationStatus.CANCELLED);
        const approvedRegistrations = registrations.filter(r => r.status === RegistrationStatus.APPROVED);
        const pendingRegistrations = registrations.filter(r => r.status === RegistrationStatus.PENDING);

        const totalPeople = activeRegistrations.reduce((sum, r) => sum + r.number_of_persons, 0);

        // Hotels data for available rooms/beds
        const hotels = await this.hotelRepository.find({
            where: { yatra_id: yatraId, is_active: true },
        });

        const availableRooms = hotels.reduce((sum, h) => sum + (h.available_rooms || 0), 0);

        // Beds calculation: this might need more logic if available_beds isn't a direct field
        // In hotel.entity.ts, I don't see available_beds. Let's check room.entity.ts again or calculate from rooms.
        // Actually, let's look at the requirement example: "availableBeds": 400
        // I'll calculate it from available rooms' beds.
        const rooms = await this.roomRepository.find({
            where: { hotel: { yatra_id: yatraId }, is_occupied: false },
        });
        const availableBeds = rooms.reduce((sum, r) => sum + (r.number_of_beds || 0), 0);

        return {
            totalRegistrations: activeRegistrations.length,
            totalPeople,
            allottedRegistrations: approvedRegistrations.length,
            pendingAllotment: pendingRegistrations.length,
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
