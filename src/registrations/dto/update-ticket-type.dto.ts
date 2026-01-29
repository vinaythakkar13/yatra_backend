import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketType } from '../enums/ticket-type.enum';

export class UpdateTicketTypeDto {
    @ApiProperty({
        enum: TicketType,
        example: TicketType.FLIGHT,
        description: 'The new ticket type to assign to the registration'
    })
    @IsNotEmpty()
    @IsEnum(TicketType)
    ticketType: TicketType;
}
