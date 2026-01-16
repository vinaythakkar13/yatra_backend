import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadBase64Dto {
  @ApiProperty({ description: 'Base64 encoded image string (with or without data URL prefix)' })
  @IsString()
  @IsNotEmpty()
  base64Image: string;

  @ApiPropertyOptional({ description: 'Folder path in Cloudinary' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Custom public ID for the image' })
  @IsOptional()
  @IsString()
  public_id?: string;

  @ApiPropertyOptional({ description: 'Tags for the image', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UploadUrlDto {
  @ApiProperty({ description: 'Image URL to upload' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Folder path in Cloudinary' })
  @IsOptional()
  @IsString()
  folder?: string;
}
