import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatusFilter {
  ALL = 'all',
  ACQUIRED = 'acquired',
  NOT_ACQUIRED = 'not_acquired',
}

export class UserStatusQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Yatra ID' })
  @IsOptional()
  @IsString()
  yatraId?: string;

  @ApiPropertyOptional({ description: 'Filter by Hotel ID or "all"' })
  @IsOptional()
  @IsString()
  hotelId?: string;

  @ApiPropertyOptional({ enum: UserStatusFilter, default: UserStatusFilter.ALL })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter = UserStatusFilter.ALL;

  @ApiPropertyOptional({ description: 'Search term for PNR, Name, Phone Number, or Hotel Name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
