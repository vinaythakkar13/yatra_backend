import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupApp } from './setup';
import express, { Express } from 'express';

// Create the Express instance
const expressApp: Express = express();

/**
 * Creates and initializes the NestJS application.
 * This function uses ExpressAdapter to integrate NestJS with Express.
 * Designed for Vercel's serverless runtime - NO app.listen() is called.
 * 
 * @param expressInstance - The Express instance to attach NestJS to
 * @returns Promise<INestApplication> - The initialized NestJS application
 */
export async function createNestApp(expressInstance: Express): Promise<INestApplication> {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    {
      bodyParser: true,
      logger: ['error', 'warn', 'log']
    }
  );

  // Setup all middleware, CORS, validation, Swagger, etc.
  setupApp(app);

  // Initialize the app (this connects all routes but does NOT listen)
  await app.init();

  return app;
}

/**
 * Exports the Express instance for use in the serverless handler.
 * This is passed to createNestApp() where NestJS attaches itself.
 */
export { expressApp };
