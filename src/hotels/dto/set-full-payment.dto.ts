import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetFullPaymentDto {
  @ApiProperty({ description: 'ID of the hotel to mark as full payment done' })
  @IsNotEmpty()
  @IsString()
  hotelId: string;
}
