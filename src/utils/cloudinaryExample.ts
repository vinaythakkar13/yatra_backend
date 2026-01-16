/**
 * Cloudinary Helper Usage Examples
 * This file demonstrates how to use the Cloudinary helper functions
 */

import {
  configureCloudinary,
  uploadImageFromUrl,
  uploadImageFromBase64,
  uploadImageFromBuffer,
  getOptimizedImageUrl,
  getSquareImageUrl,
  deleteImage,
  uploadMultipleImages,
} from './cloudinaryHelper';

/**
 * Example 1: Upload image from URL
 */
export const exampleUploadFromUrl = async () => {
  try {
    const result = await uploadImageFromUrl('https://example.com/image.jpg', {
      folder: 'yatra/tickets',
      public_id: 'ticket_123',
      tags: ['ticket', 'user_upload'],
    });

    console.log('Upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

/**
 * Example 2: Upload image from base64 string
 */
export const exampleUploadFromBase64 = async (base64String: string) => {
  try {
    const result = await uploadImageFromBase64(base64String, {
      folder: 'yatra/profiles',
      public_id: 'profile_user_123',
    });

    console.log('Upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

/**
 * Example 3: Upload image from file buffer (from multer or similar)
 */
export const exampleUploadFromBuffer = async (fileBuffer: Buffer, fileName: string) => {
  try {
    const result = await uploadImageFromBuffer(fileBuffer, {
      folder: 'yatra/uploads',
      public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
      tags: ['upload', 'user_generated'],
    });

    console.log('Upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

/**
 * Example 4: Get optimized image URL
 */
export const exampleGetOptimizedUrl = (publicId: string) => {
  // Auto-optimize with format and quality
  const optimizedUrl = getOptimizedImageUrl(publicId, {
    fetchFormat: 'auto',
    quality: 'auto',
  });

  console.log('Optimized URL:', optimizedUrl);
  return optimizedUrl;
};

/**
 * Example 5: Get auto-cropped square image
 */
export const exampleGetSquareImage = (publicId: string) => {
  // Get 500x500 auto-cropped square image
  const squareUrl = getSquareImageUrl(publicId, 500);

  console.log('Square image URL:', squareUrl);
  return squareUrl;
};

/**
 * Example 6: Get custom transformed image
 */
export const exampleGetCustomTransform = (publicId: string) => {
  const transformedUrl = getOptimizedImageUrl(publicId, {
    width: 800,
    height: 600,
    crop: 'fill',
    gravity: 'face', // Focus on faces
    quality: 90,
    fetchFormat: 'webp',
  });

  console.log('Transformed URL:', transformedUrl);
  return transformedUrl;
};

/**
 * Example 7: Upload multiple images
 */
export const exampleUploadMultiple = async (imageUrls: string[]) => {
  try {
    const results = await uploadMultipleImages(imageUrls, {
      folder: 'yatra/tickets',
      tags: ['ticket', 'batch_upload'],
    });

    console.log(`Uploaded ${results.length} images successfully`);
    return results.map((r) => r.secure_url);
  } catch (error) {
    console.error('Batch upload failed:', error);
    throw error;
  }
};

/**
 * Example 8: Delete image
 */
export const exampleDeleteImage = async (publicId: string) => {
  try {
    const result = await deleteImage(publicId);
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};

/**
 * Example usage in Express route handler
 */
export const exampleRouteHandler = async (req: any, res: any) => {
  try {
    // Assuming image URL comes from request body
    const { imageUrl } = req.body;

    // Upload image
    const uploadResult = await uploadImageFromUrl(imageUrl, {
      folder: 'yatra/tickets',
      tags: ['ticket', 'user_upload'],
    });

    // Get optimized URL for display
    const optimizedUrl = getOptimizedImageUrl(uploadResult.public_id, {
      width: 1200,
      quality: 'auto',
      fetchFormat: 'auto',
    });

    // Get thumbnail URL
    const thumbnailUrl = getSquareImageUrl(uploadResult.public_id, 200);

    res.json({
      success: true,
      data: {
        original: uploadResult.secure_url,
        optimized: optimizedUrl,
        thumbnail: thumbnailUrl,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: (error as Error).message,
    });
  }
};

