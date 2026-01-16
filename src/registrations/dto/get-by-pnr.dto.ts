import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetByPnrDto {
  @ApiProperty({ 
    example: '4829635210',
    description: 'PNR number (exactly 10 digits)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'PNR must be exactly 10 digits' })
  pnr: string;
}
