import { IsString, IsNotEmpty, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeliverPrasadamDto {
  @ApiProperty({
    example: 'PNR123456',
    description: 'PNR number (6-12 characters, alphanumeric, case-insensitive)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{6,12}$/i, { message: 'PNR must be 6-12 alphanumeric characters' })
  pnr: string;

  @ApiProperty({
    example: 'f5856866-7bcf-401c-9a17-0c845067240b',
    description: 'Yatra ID'
  })
  @IsUUID()
  @IsNotEmpty()
  yatraId: string;
}
