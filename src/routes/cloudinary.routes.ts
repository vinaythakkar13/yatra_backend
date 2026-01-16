/**
 * Cloudinary Image Upload Routes
 * API endpoints for image upload and management
 */

import { Router, Request, Response } from 'express';
import {
  uploadImageFromUrl,
  uploadImageFromBase64,
  uploadMultipleImages,
  getOptimizedImageUrl,
  getSquareImageUrl,
  deleteImage,
  validateCloudinaryConfig,
} from '../utils/cloudinaryHelper';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateAdmin } from '../middleware/auth';
const router = Router();

/**
 * @swagger
 * /api/cloudinary/upload-url:
 *   post:
 *     summary: Upload image from URL
 *     tags: [Cloudinary]
 *     description: Upload an image from an external URL to Cloudinary
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImageUploadRequest'
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/CloudinaryUploadResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/upload-url',
  authenticateAdmin,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!validateCloudinaryConfig()) {
      errorResponse(res, 'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file', 500);
      return;
    }

    const { imageUrl, folder, public_id, tags } = req.body;

    if (!imageUrl) {
      errorResponse(res, 'imageUrl is required', 400);
      return;
    }

    const result = await uploadImageFromUrl(imageUrl, {
      folder: folder || 'yatra',
      public_id,
      tags: tags || [],
    });

    successResponse(res, result, 'Image uploaded successfully');
  })
);

/**
 * @swagger
 * /api/cloudinary/upload-base64:
 *   post:
 *     summary: Upload image from base64 string
 *     tags: [Cloudinary]
 *     description: Upload an image from a base64 encoded string to Cloudinary
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Base64UploadRequest'
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/CloudinaryUploadResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/upload-base64',
  authenticateAdmin,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!validateCloudinaryConfig()) {
      errorResponse(res, 'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file', 500);
      return;
    }

    const { base64Image, folder, public_id, tags } = req.body;

    console.log(base64Image, folder, public_id, tags, 'req.body');

    if (!base64Image) {
      errorResponse(res, 'base64Image is required', 400);
      return;
    }

    const result = await uploadImageFromBase64(base64Image, {
      folder: folder || 'yatra',
      public_id,
      tags: tags || [],
    });

    successResponse(res, result, 'Image uploaded successfully');
  })
);

/**
 * @swagger
 * /api/cloudinary/upload-multiple:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Cloudinary]
 *     description: Upload multiple images from URLs in a single request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MultipleImageUploadRequest'
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Images uploaded successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CloudinaryUploadResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/upload-multiple',
  authenticateAdmin,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!validateCloudinaryConfig()) {
      errorResponse(res, 'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file', 500);
      return;
    }

    const { imageUrls, folder, tags } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      errorResponse(res, 'imageUrls array is required', 400);
      return;
    }

    const results = await uploadMultipleImages(imageUrls, {
      folder: folder || 'yatra',
      tags: tags || [],
    });

    successResponse(res, results, `Successfully uploaded ${results.length} images`);
  })
);

/**
 * @swagger
 * /api/cloudinary/optimize:
 *   post:
 *     summary: Get optimized image URLs
 *     tags: [Cloudinary]
 *     description: Get optimized and thumbnail URLs for an uploaded image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - public_id
 *             properties:
 *               public_id:
 *                 type: string
 *                 example: 'yatra/tickets/ticket_123'
 *                 description: Cloudinary public ID
 *               width:
 *                 type: integer
 *                 example: 1200
 *                 description: Desired width for optimized image (optional)
 *               quality:
 *                 type: string
 *                 example: 'auto'
 *                 description: Image quality (auto, 80, 90, etc.)
 *     responses:
 *       200:
 *         description: Optimized URLs generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Optimized URLs generated successfully
 *                 data:
 *                   $ref: '#/components/schemas/OptimizedImageUrl'
 */
router.post(
  '/optimize',
  authenticateAdmin,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!validateCloudinaryConfig()) {
      errorResponse(res, 'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file', 500);
      return;
    }

    const { public_id, width, quality } = req.body;

    if (!public_id) {
      errorResponse(res, 'public_id is required', 400);
      return;
    }

    const optimizedUrl = getOptimizedImageUrl(public_id, {
      width: width || undefined,
      quality: quality || 'auto',
      fetchFormat: 'auto',
    });

    const thumbnailUrl = getSquareImageUrl(public_id, 200);

    successResponse(res, {
      public_id,
      optimized: optimizedUrl,
      thumbnail: thumbnailUrl,
    }, 'Optimized URLs generated successfully');
  })
);

/**
 * @swagger
 * /api/cloudinary/delete:
 *   delete:
 *     summary: Delete image from Cloudinary
 *     tags: [Cloudinary]
 *     description: Delete an image from Cloudinary by public ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImageDeleteRequest'
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: string
 *                       example: 'ok'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/delete',
  authenticateAdmin,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!validateCloudinaryConfig()) {
      errorResponse(res, 'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file', 500);
      return;
    }

    const { public_id } = req.body;

    if (!public_id) {
      errorResponse(res, 'public_id is required', 400);
      return;
    }

    const result = await deleteImage(public_id);

    successResponse(res, result, 'Image deleted successfully');
  })
);

export default router;

