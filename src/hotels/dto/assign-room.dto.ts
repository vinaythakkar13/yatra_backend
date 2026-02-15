import { IsString, IsNotEmpty, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RoomDetailDto {
    @ApiProperty({ example: 'hotel-uuid', description: 'ID of the hotel' })
    @IsUUID()
    @IsNotEmpty()
    hotelId: string;

    @ApiProperty({ example: '1', description: 'Floor number' })
    @IsString()
    @IsNotEmpty()
    floor: string;

    @ApiProperty({ example: '101', description: 'Room number' })
    @IsString()
    @IsNotEmpty()
    roomNumber: string;
}

export class AssignRoomDto {
    @ApiProperty({ example: 'registration-uuid', description: 'ID of the registration' })
    @IsUUID()
    @IsNotEmpty()
    registrationId: string;

    @ApiProperty({ type: [RoomDetailDto], description: 'List of rooms to assign' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoomDetailDto)
    assignments: RoomDetailDto[];
}
