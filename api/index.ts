/**
 * Vercel Serverless Entry Point for NestJS Application
 * 
 * This file exports a serverless handler function that wraps the NestJS application
 * for deployment on Vercel's serverless platform.
 * 
 * The handler initializes the NestJS app once and reuses it for subsequent requests
 * to minimize cold start times.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { corsLogger } from './cors-logger.middleware';

// Cache the NestJS app instance to reuse across invocations
let cachedApp: express.Express;

/**
 * Initialize and configure the NestJS application
 * This function is called once and the app instance is cached
 */
async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    bodyParser: true,
    rawBody: false,
  });

  // Configure body parser limits for large base64 image uploads (20MB)
  expressApp.use(express.json({ limit: '20mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Global logging middleware for all requests
  expressApp.use(corsLogger);

  // CORS Configuration
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log('🌍 Request Origin:', origin);

      const allowedOrigins: string[] = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://yatra-kappa.vercel.app/'
      ];

      // Allow server-to-server or Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('❌ CORS BLOCKED:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization'
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation (only in non-production or if explicitly enabled)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Yatra Event Management System API')
      .setDescription('Backend API for managing pilgrimage events, accommodations, and participant registrations')
      .setVersion('2.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'bearerAuth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Yatra API Documentation',
    });

    // API docs JSON endpoint
    app.getHttpAdapter().get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });
  }

  // Prefix for all routes
  app.setGlobalPrefix('api');

  // Initialize the app (but don't listen - Vercel handles that)
  await app.init();

  cachedApp = expressApp;
  return expressApp;
}

/**
 * Vercel Serverless Handler
 * This is the entry point for all requests on Vercel
 */
export default async function handler(req: express.Request, res: express.Response) {
  const app = await createApp();
  return app(req, res);
}
