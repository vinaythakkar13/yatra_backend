import { IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateYatraDto {
  @ApiProperty({ example: 'Shri Shirdi Yatra 2025' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsNotEmpty()
  banner_image: string;

  @ApiPropertyOptional({ example: 'https://example.com/mobile-banner.jpg' })
  @IsOptional()
  @IsString()
  mobile_banner_image?: string;

  @ApiProperty({ example: '2025-11-01T00:00:00.000Z' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2025-11-10T00:00:00.000Z' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ example: '2025-10-01T00:00:00.000Z' })
  @IsDateString()
  registration_start_date: string;

  @ApiProperty({ example: '2025-10-25T00:00:00.000Z' })
  @IsDateString()
  registration_end_date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
