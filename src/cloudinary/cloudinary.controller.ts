import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { UploadBase64Dto, UploadUrlDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cloudinary')
@Controller('cloudinary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload-base64')
  @ApiOperation({ summary: 'Upload image from base64 string' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid base64 string' })
  async uploadBase64(@Body() uploadDto: UploadBase64Dto) {
    const result = await this.cloudinaryService.uploadBase64(
      uploadDto.base64Image,
      uploadDto.folder,
      {
        public_id: uploadDto.public_id,
        tags: uploadDto.tags || [],
      },
    );
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: result.data,
    };
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Upload image from URL' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  async uploadUrl(@Body() uploadDto: UploadUrlDto) {
    const result = await this.cloudinaryService.uploadUrl(uploadDto.url, uploadDto.folder);
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: result.data,
    };
  }
}
