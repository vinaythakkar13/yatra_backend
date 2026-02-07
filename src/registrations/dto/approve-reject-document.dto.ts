import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveDocumentDto {
    @ApiPropertyOptional({ example: 'Documents are clear and valid' })
    @IsOptional()
    @IsString()
    comments?: string;
}

export class RejectDocumentDto {
    @ApiProperty({ example: 'Ticket image is blurry or incorrect' })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiPropertyOptional({ example: 'Please upload a clear picture of the full ticket' })
    @IsOptional()
    @IsString()
    comments?: string;
}
