import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelRegistrationDto {
  @ApiProperty({ example: 'Change of plans', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
