import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetFullPaymentDto {
  @ApiProperty({ description: 'ID of the hotel to mark as full payment done' })
  @IsNotEmpty()
  @IsString()
  hotelId: string;

  @ApiProperty({ description: 'Additional amount to subtract (discount) or add (premium)', required: false })
  @IsOptional()
  @IsNumber()
  adjustmentAmount?: number;

  @ApiProperty({ description: 'Type of adjustment: discount or premium', enum: ['discount', 'premium'], required: false })
  @IsOptional()
  @IsEnum(['discount', 'premium'])
  adjustmentType?: 'discount' | 'premium';

  @ApiProperty({ description: 'Comment about the adjustment', required: false })
  @IsOptional()
  @IsString()
  paymentComment?: string;
}
