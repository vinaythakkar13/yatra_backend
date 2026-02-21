import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HotelLoginDto {
    @ApiProperty({ example: 'HTL-1234' })
    @IsString()
    @IsNotEmpty()
    login_id: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
