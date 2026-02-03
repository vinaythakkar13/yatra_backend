import { IsString, IsUUID, IsOptional, IsBoolean, IsInt, IsArray, IsDateString, ValidateNested, Min, Max, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FloorRoomDto {
  @ApiPropertyOptional({ description: 'Room number (can be empty if using roomNumbers array)' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ enum: ['western', 'indian'], default: 'western' })
  @IsOptional()
  @IsString()
  toiletType?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfBeds?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Min(0)
  chargePerDay?: number;
}

class FloorDto {
  @ApiProperty({ description: 'Floor number identifier' })
  @IsString()
  floorNumber: string;

  @ApiProperty({ description: 'Number of rooms on this floor' })
  @IsInt()
  @Min(1)
  numberOfRooms: number;

  @ApiProperty({ type: [String], description: 'Array of room numbers' })
  @IsArray()
  @IsString({ each: true })
  roomNumbers: string[];

  @ApiPropertyOptional({ type: [FloorRoomDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorRoomDto)
  rooms?: FloorRoomDto[];
}

class RoomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Room number' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'Floor number' })
  @IsInt()
  floor: number;

  @ApiPropertyOptional({ enum: ['western', 'indian'], default: 'western' })
  @IsOptional()
  @IsString()
  toiletType?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfBeds?: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Min(0)
  chargePerDay?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOccupied?: boolean;
}

export class CreateHotelDto {
  @ApiProperty({ description: 'Yatra UUID' })
  @IsUUID()
  yatra: string;

  @ApiProperty({ description: 'Hotel name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hotel address' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Google Maps or other map URL' })
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiPropertyOptional({ description: 'Distance from bhavan (e.g., "2.5 km")' })
  @IsOptional()
  @IsString()
  distanceFromBhavan?: string;

  @ApiPropertyOptional({ description: 'Hotel type classification (A, B, C, etc.)' })
  @IsOptional()
  @IsString()
  hotelType?: string;

  @ApiPropertyOptional({ description: 'Hotel manager name' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ description: 'Manager contact number' })
  @IsOptional()
  @IsString()
  managerContact?: string;

  @ApiPropertyOptional({ description: 'URL of the visiting card image' })
  @IsOptional()
  @IsString()
  visitingCardImage?: string;

  @ApiPropertyOptional({ description: 'Number of days for booking period', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfDays?: number;

  @ApiPropertyOptional({ description: 'Booking start date (ISO format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Booking end date (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Check-in time (HH:mm format)', example: '14:00' })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiPropertyOptional({ description: 'Check-out time (HH:mm format)', example: '11:00' })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional({ description: 'Whether hotel has elevator', default: false })
  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  @ApiPropertyOptional({ description: 'Total number of floors', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  totalFloors?: number;

  @ApiPropertyOptional({ type: [FloorDto], description: 'Nested floor structure with rooms' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorDto)
  floors?: FloorDto[];

  @ApiPropertyOptional({ type: [RoomDto], description: 'Flat array of rooms (alternative structure)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms?: RoomDto[];

  @ApiPropertyOptional({ description: 'Advance amount paid for the hotel', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advancePaidAmount?: number;

  @ApiPropertyOptional({ description: 'Whether full payment has been made', default: false })
  @IsOptional()
  @IsBoolean()
  fullPaymentPaid?: boolean;
}
