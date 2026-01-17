import { Request, Response } from 'express';
import { createNestApp, server } from '../src/main';

// Global promise to reuse the instance (warm start optimization)
let appPromise: Promise<any> | null = null;

/**
 * Main Vercel serverless function handler.
 */
export default async (req: Request, res: Response) => {
    try {
        if (!appPromise) {
            console.log('Vercel Cold Start: Initializing NestJS application...');
            appPromise = createNestApp(server);
        }

        // Wait for NestJS to be fully initialized before handling the request
        await appPromise;

        // Pass the request to the Express server
        server(req, res);
    } catch (error) {
        console.error('Vercel Request Handler Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error during initialization',
        });
    }
};
