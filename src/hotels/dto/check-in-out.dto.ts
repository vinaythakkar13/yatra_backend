import { IsEnum, IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CheckInActionType {
    CHECK_IN = 'check_in',
    CHECK_OUT = 'check_out',
}

export class CheckInOutDto {
    @ApiProperty({ description: 'PNR number of the registration', example: 'YTR20261234' })
    @IsString()
    @IsNotEmpty()
    @Length(1, 12)
    pnr: string;

    @ApiProperty({
        description: 'Action type: check_in or check_out',
        enum: CheckInActionType,
        example: CheckInActionType.CHECK_IN,
    })
    @IsEnum(CheckInActionType, { message: 'type must be either check_in or check_out' })
    type: CheckInActionType;
}
