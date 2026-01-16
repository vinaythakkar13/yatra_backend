import { IsEmail, IsString, IsOptional, IsArray, MinLength, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@yatra.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @Length(2, 255)
  @Matches(/^[a-zA-Z\s.'-]+$/, {
    message: 'Name can only contain letters, spaces, dots, hyphens, and apostrophes',
  })
  name: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Contact number must be 10-15 digits',
  })
  contact_number?: string;

  @ApiPropertyOptional({ type: [String], example: ['manage_users', 'manage_hotels'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
