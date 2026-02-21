import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoomAssignmentStatus } from '../../entities/user.entity';

export class BulkRoomStatusUpdateDto {
    @ApiProperty({
        description: 'The new status for room assignments',
        enum: RoomAssignmentStatus,
        example: RoomAssignmentStatus.ALLOTED,
    })
    @IsEnum(RoomAssignmentStatus)
    @IsNotEmpty()
    status: RoomAssignmentStatus;
}
