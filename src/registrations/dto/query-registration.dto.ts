import { IsOptional, IsInt, IsUUID, IsEnum, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationStatus } from '../../entities/yatra-registration.entity';

export enum RegistrationFilterMode {
  ALL = 'all',
  GENERAL = 'general',
  CANCELLED = 'cancelled',
}

export class QueryRegistrationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by yatra ID' })
  @IsOptional()
  @IsUUID()
  yatraId?: string;

  @ApiPropertyOptional({ enum: RegistrationStatus, description: 'Filter by registration status' })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @ApiPropertyOptional({ description: 'Filter by PNR' })
  @IsOptional()
  @IsString()
  pnr?: string;

  @ApiPropertyOptional({ description: 'Search by name, PNR, or WhatsApp number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RegistrationFilterMode, default: RegistrationFilterMode.ALL, description: 'Filter by mode' })
  @IsOptional()
  @IsEnum(RegistrationFilterMode)
  filterMode?: RegistrationFilterMode = RegistrationFilterMode.ALL;
}
