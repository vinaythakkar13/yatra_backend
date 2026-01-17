/**
 * Vercel Serverless Entry Point for NestJS Application
 *
 * This file exports a serverless handler function that wraps the NestJS application
 * for deployment on Vercel's serverless platform.
 *
 * The handler initializes the NestJS app once and reuses it for subsequent requests
 * to minimize cold start times.
 */
import * as express from 'express';
/**
 * Vercel Serverless Handler
 * This is the entry point for all requests on Vercel
 */
export default function handler(req: express.Request, res: express.Response): Promise<any>;
//# sourceMappingURL=index.d.ts.map