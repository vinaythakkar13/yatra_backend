/**
 * Cloudinary Image Upload Helper
 * Handles image uploads, optimization, and transformations
 * Uses environment variables for configuration
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

/**
 * Configure Cloudinary with environment variables
 * Should be called once at application startup
 */
export const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true, // Use HTTPS
  });
};

/**
 * Upload options interface
 */
export interface UploadOptions {
  folder?: string; // Folder path in Cloudinary
  public_id?: string; // Custom public ID
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  format?: string; // Force format conversion
  transformation?: any[]; // Image transformations
  overwrite?: boolean; // Overwrite existing images
  invalidate?: boolean; // Invalidate CDN cache
  tags?: string[]; // Tags for organization
}

/**
 * Upload result interface
 */
export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  resource_type: string;
}

/**
 * Upload image from URL
 * @param imageUrl - URL of the image to upload
 * @param options - Upload options
 * @returns Upload result with image details
 */
export const uploadImageFromUrl = async (
  imageUrl: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: options.folder || 'yatra',
      public_id: options.public_id,
      resource_type: options.resource_type || 'image',
      format: options.format,
      transformation: options.transformation,
      overwrite: options.overwrite || false,
      invalidate: options.invalidate || true,
      tags: options.tags || [],
    });

    return {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      created_at: uploadResult.created_at,
      resource_type: uploadResult.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error (upload_from_url):', error);
    throw new Error(`Failed to upload image from URL: ${(error as Error).message}`);
  }
};

/**
 * Upload image from base64 string
 * @param base64String - Base64 encoded image string (with or without data URI prefix)
 * @param options - Upload options
 * @returns Upload result with image details
 */
export const uploadImageFromBase64 = async (
  base64String: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    // Remove data URI prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: options.folder || 'yatra',
        public_id: options.public_id,
        resource_type: options.resource_type || 'image',
        format: options.format,
        transformation: options.transformation,
        overwrite: options.overwrite || false,
        invalidate: options.invalidate || true,
        tags: options.tags || [],
      }
    );

    return {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      created_at: uploadResult.created_at,
      resource_type: uploadResult.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error (upload_from_base64):', error);
    throw new Error(`Failed to upload image from base64: ${(error as Error).message}`);
  }
};

/**
 * Upload image from file buffer
 * @param buffer - Image file buffer
 * @param options - Upload options
 * @returns Upload result with image details
 */
export const uploadImageFromBuffer = async (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'yatra',
          public_id: options.public_id,
          resource_type: options.resource_type || 'image',
          format: options.format,
          transformation: options.transformation,
          overwrite: options.overwrite || false,
          invalidate: options.invalidate || true,
          tags: options.tags || [],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error (upload_from_buffer):', error);
            reject(new Error(`Failed to upload image from buffer: ${error.message}`));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              created_at: result.created_at,
              resource_type: result.resource_type,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error (upload_from_buffer):', error);
    throw new Error(`Failed to upload image from buffer: ${(error as Error).message}`);
  }
};

/**
 * Generate optimized image URL
 * Automatically applies format and quality optimization
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: string | number;
    format?: string;
    fetchFormat?: 'auto' | 'jpg' | 'png' | 'webp' | 'gif';
  } = {}
): string => {
  return cloudinary.url(publicId, {
    fetch_format: options.fetchFormat || 'auto',
    quality: options.quality || 'auto',
    width: options.width,
    height: options.height,
    crop: options.crop || 'auto',
    gravity: options.gravity || 'auto',
    format: options.format,
    secure: true, // Always use HTTPS
  });
};

/**
 * Generate auto-cropped square image URL
 * @param publicId - Cloudinary public ID
 * @param size - Size of the square (width and height)
 * @returns Auto-cropped square image URL
 */
export const getSquareImageUrl = (publicId: string, size: number = 500): string => {
  return cloudinary.url(publicId, {
    crop: 'auto',
    gravity: 'auto',
    width: size,
    height: size,
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Deletion result
 */
export const deleteImage = async (publicId: string): Promise<{ result: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true, // Invalidate CDN cache
    });

    if (result.result === 'ok') {
      console.log('Cloudinary image deleted:', publicId);
    }

    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${(error as Error).message}`);
  }
};

/**
 * Upload multiple images
 * @param imageUrls - Array of image URLs
 * @param options - Upload options
 * @returns Array of upload results
 */
export const uploadMultipleImages = async (
  imageUrls: string[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = imageUrls.map((url, index) =>
      uploadImageFromUrl(url, {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
      })
    );

    const results = await Promise.all(uploadPromises);

    console.log(`Cloudinary: Uploaded ${results.length} images to folder: ${options.folder || 'yatra'}`);

    return results;
  } catch (error) {
    console.error('Cloudinary upload error (upload_multiple):', error);
    throw new Error(`Failed to upload multiple images: ${(error as Error).message}`);
  }
};

/**
 * Validate Cloudinary configuration
 * @returns true if configuration is valid
 */
export const validateCloudinaryConfig = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  return true;
};

