import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, Min, Max, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional({ description: 'Floor number identifier' })
  @IsString()
  floorNumber: string;

  @ApiPropertyOptional({ description: 'Number of rooms on this floor' })
  @IsInt()
  @Min(1)
  numberOfRooms: number;

  @ApiPropertyOptional({ type: [String], description: 'Array of room numbers' })
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

  @ApiPropertyOptional({ description: 'Room number' })
  @IsString()
  roomNumber: string;

  @ApiPropertyOptional({ description: 'Floor number' })
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

export class UpdateHotelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  distanceFromBhavan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hotelType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerContact?: string;

  @ApiPropertyOptional({ description: 'URL of the visiting card image' })
  @IsOptional()
  @IsString()
  visitingCardImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Advance amount paid for the hotel', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advancePaidAmount?: number;

  @ApiPropertyOptional({ description: 'Whether full payment has been made' })
  @IsOptional()
  @IsBoolean()
  fullPaymentPaid?: boolean;

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
}
