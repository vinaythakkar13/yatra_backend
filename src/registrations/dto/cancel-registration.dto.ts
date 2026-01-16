import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelRegistrationDto {
  @ApiProperty({ example: 'Change of plans' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
