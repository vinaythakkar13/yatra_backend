import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateYatraDto {
    @ApiPropertyOptional({ example: 'Shri Shirdi Yatra 2025' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
    @IsOptional()
    @IsString()
    banner_image?: string;

    @ApiPropertyOptional({ example: 'https://example.com/mobile-banner.jpg' })
    @IsOptional()
    @IsString()
    mobile_banner_image?: string;

    @ApiPropertyOptional({ example: '2025-11-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    start_date?: string;

    @ApiPropertyOptional({ example: '2025-11-10T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    end_date?: string;

    @ApiPropertyOptional({ example: '2025-10-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    registration_start_date?: string;

    @ApiPropertyOptional({ example: '2025-10-25T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    registration_end_date?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}
