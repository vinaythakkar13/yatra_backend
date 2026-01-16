import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPnrDto {
  @ApiProperty({ example: 'PNR1234567' })
  @IsString()
  @IsNotEmpty()
  pnr: string;
}
