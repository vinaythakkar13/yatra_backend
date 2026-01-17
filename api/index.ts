import { Request, Response } from 'express';
import { createNestApp, expressApp } from '../src/main';

/**
 * Singleton pattern to cache the NestJS application instance.
 * This enables warm starts in Vercel's serverless runtime.
 * Cold start: Initialize once, reuse for subsequent requests.
 */
let nestAppPromise: Promise<any> | null = null;

/**
 * Vercel Serverless Handler
 * 
 * This is the entry point for all incoming HTTP requests to Vercel.
 * It initializes the NestJS application once (cached via singleton pattern)
 * and then routes all requests through the Express instance.
 * 
 * @param req - Express Request object
 * @param res - Express Response object
 */
export default async (req: Request, res: Response) => {
  try {
    // Cold start: Initialize NestJS app if not already done
    if (!nestAppPromise) {
      console.log('[Vercel] Cold Start: Initializing NestJS application...');
      nestAppPromise = createNestApp(expressApp);
    }

    // Wait for NestJS to be fully initialized (warm start reuses cached promise)
    await nestAppPromise;

    // Route the request through the Express server
    expressApp(req, res);
  } catch (error) {
    console.error('[Vercel] Handler Error:', error);
    
    // Ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error during request handling',
      });
    }
  }
};
