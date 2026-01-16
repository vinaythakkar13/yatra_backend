import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRegistrationDto {
  @ApiPropertyOptional({ example: 'All documents verified' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectRegistrationDto {
  @ApiProperty({ example: 'Ticket image is not valid or unclear' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'Please upload clear ticket images' })
  @IsOptional()
  @IsString()
  comments?: string;
}
