import {
  IsString,
  IsUUID,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../entities/user.entity';

class PersonDto {
  @ApiProperty({ example: 'Vinay Thakkar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 27, minimum: 1, maximum: 120 })
  @IsInt()
  @Min(1)
  age: number;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsString()
  @IsNotEmpty()
  gender: Gender;

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
  @ApiProperty({ example: 'Bhavnagar' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'GUJARAT' })
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class CreateRegistrationDto {
  @ApiProperty({ example: '4829635210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'PNR must be exactly 10 digits' })
  pnr: string;

  @ApiProperty({ example: 'Vinay Thakkar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9737050180' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'WhatsApp number must be 10-15 digits' })
  whatsappNumber: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  numberOfPersons: number;

  @ApiProperty({ example: '4913292c-60c9-4372-ab51-7962281611bf' })
  @IsUUID()
  @IsNotEmpty()
  yatraId: string;

  @ApiProperty({ type: [PersonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonDto)
  persons: PersonDto[];

  @ApiProperty({ type: BoardingPointDto })
  @ValidateNested()
  @Type(() => BoardingPointDto)
  boardingPoint: BoardingPointDto;

  @ApiProperty({ example: '2026-03-23T18:30:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  arrivalDate: string;

  @ApiProperty({ example: '2026-03-25T18:30:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/ticket1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ticketImages?: string[];
}
