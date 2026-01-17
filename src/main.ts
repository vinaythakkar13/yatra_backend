import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupApp } from './setup';
import express, { Express } from 'express';

// Create the Express instance
const server: Express = express();

/**
 * Thie function initializes the NestJS application on an existing Express instance.
 * It is designed to be used by Vercel's serverless runtime.
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

  setupApp(app);
  await app.init();
  return app;
}

/**
 * Vercel's @vercel/node runtime expects a default export function (req, res) => ...
 * Since we are using an existing Express instance for routing, we export the server
 * so it can be used in the entry point.
 */
export { server };
