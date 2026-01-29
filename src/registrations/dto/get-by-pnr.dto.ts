import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetByPnrDto {
  @ApiProperty({
    example: 'PNR123456',
    description: 'PNR number (6-12 characters, alphanumeric, case-insensitive)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{6,12}$/i, { message: 'PNR must be 6-12 alphanumeric characters' })
  pnr: string;
}
