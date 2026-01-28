import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardQueryDto {
    @ApiProperty({ description: 'The unique identifier of the Yatra' })
    @IsUUID()
    @IsNotEmpty()
    yatraId: string;
}
