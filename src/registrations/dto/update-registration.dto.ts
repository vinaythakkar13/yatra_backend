import {
  IsString,
  IsInt,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNotEmpty,
  Min,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../entities/user.entity';

class PersonDto {
  @ApiPropertyOptional({ example: 'Vinay Thakkar' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 27, minimum: 1, maximum: 120 })
  @IsOptional()
  @IsInt()
  @Min(1)
  age?: number;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  gender?: Gender;

  @ApiPropertyOptional({ 
    default: false, 
    description: 'Whether the person is handicapped. If not provided, defaults to false.',
    example: false 
  })
  @IsOptional()
  @IsBoolean()
  isHandicapped?: boolean;
}

class BoardingPointDto {
  @ApiPropertyOptional({ example: 'Bhavnagar' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiPropertyOptional({ example: 'GUJARAT' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;
}

export class UpdateRegistrationDto {
  @ApiPropertyOptional({ example: 'Vinay Thakkar' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: '9737050180' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'WhatsApp number must be 10-15 digits' })
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfPersons?: number;

  @ApiPropertyOptional({ type: [PersonDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonDto)
  persons?: PersonDto[];

  @ApiPropertyOptional({ type: BoardingPointDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BoardingPointDto)
  boardingPoint?: BoardingPointDto;

  @ApiPropertyOptional({ example: '2026-03-23T18:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @ApiPropertyOptional({ example: '2026-03-25T18:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/ticket1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ticketImages?: string[];
}
