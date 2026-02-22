import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { configureCloudinary, uploadImageFromBase64, uploadImageFromBuffer, uploadImageFromUrl } from '../utils/cloudinaryHelper';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Initialize Cloudinary configuration only if credentials are present
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      configureCloudinary();
    } else if (process.env.NODE_ENV !== 'test') {
      console.warn('⚠️  Cloudinary not configured. Image upload features will not work.');
      console.warn('Cloudinary configuration status:', {
        hasCloudName: !!cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      });
    }
  }

  async uploadBase64(base64String: string, folder?: string, options?: any) {
    try {
      const result = await uploadImageFromBase64(base64String, { folder, ...options });
      return {
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          created_at: result.created_at,
          resource_type: result.resource_type,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to upload image');
    }
  }

  async uploadBuffer(buffer: Buffer, folder?: string, options?: any) {
    try {
      const result = await uploadImageFromBuffer(buffer, { folder, ...options });
      return {
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          created_at: result.created_at,
          resource_type: result.resource_type,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to upload image');
    }
  }

  async uploadUrl(imageUrl: string, folder?: string, options?: any) {
    try {
      const result = await uploadImageFromUrl(imageUrl, { folder, ...options });
      return {
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          created_at: result.created_at,
          resource_type: result.resource_type,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to upload image');
    }
  }
}
