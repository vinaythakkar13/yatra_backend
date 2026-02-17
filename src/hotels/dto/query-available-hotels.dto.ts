import { IsOptional, IsInt, Min, Max, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueryHotelDto } from './query-hotel.dto';

export class QueryAvailableHotelsDto extends QueryHotelDto {
    @ApiProperty({ description: 'Filter hotels by yatra ID (Mandatory)' })
    @IsNotEmpty()
    @IsUUID()
    yatra: string;

    @ApiPropertyOptional({ description: 'Filter by available rooms with specific number of beds (e.g., 2, 3, 4)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    beds?: number;
}
