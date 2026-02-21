/**
 * Vercel Serverless Entry Point for NestJS Application
 * 
 * This file exports a serverless handler function that wraps the NestJS application
 * for deployment on Vercel's serverless platform.
 * 
 * Modern Express 5+ compatible implementation:
 * ✅ No deprecated app.router usage
 * ✅ No app.listen() call
 * ✅ Proper ExpressAdapter usage
 * ✅ Request caching for cold start optimization
 * ✅ Full CORS support for production
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Express, Request, Response } from 'express';
import { corsLogger } from './cors-logger.middleware';

/**
 * Type for cached app instance
 */
interface CachedAppInstance {
  app: Express;
  isInitialized: boolean;
}

let cachedInstance: CachedAppInstance | null = null;

/**
 * Initialize and configure the NestJS application
 * This function is called once and the app instance is cached
 * for subsequent serverless invocations
 */
async function createApp(): Promise<Express> {
  // Return cached app if already initialized
  if (cachedInstance?.isInitialized) {
    return cachedInstance.app;
  }

  // Create Express instance
  const expressApp = express();

  // Create NestJS adapter from Express instance
  const adapter = new ExpressAdapter(expressApp);

  // Create NestJS application with Express adapter
  const app = await NestFactory.create(AppModule, adapter, {
    bodyParser: false,
    rawBody: false,
  });

  // ============================================
  // Middleware Configuration
  // ============================================

  // Body parser middleware - 20MB limit for image uploads
  expressApp.use(express.json({ limit: '20mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Request logging middleware
  expressApp.use(corsLogger);

  // Diagnostic CORS middleware
  expressApp.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log('🔍 PREFLIGHT DIAGNOSTIC');
      console.log('   - Origin:', req.headers.origin);
      console.log('   - Request Method:', req.headers['access-control-request-method']);
      console.log('   - Request Headers:', req.headers['access-control-request-headers']);
    }
    next();
  });

  // ============================================
  // CORS Configuration (Production-Ready)
  // ============================================
  const getAllowedOrigins = (): string[] => {
    // Get from environment or use defaults
    const envOrigins = process.env.CORS_ORIGIN;
    if (envOrigins) {
      return envOrigins.split(',').map(o => o.trim());
    }

    // Default origins for development and production
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'https://yatra-kappa.vercel.app',
      'https://yatra-backend.vercel.app',
      'https://yatra-git-feature-hotel-module-vinay-thakkar.vercel.app',
      'https://yatra-git-development-vinay-thakkar.vercel.app/admin/login'
    ];
  };

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = getAllowedOrigins();

      console.log(`🌍 Incoming request from origin: ${origin || '[server-to-server]'}`);

      // Check if origin is in allowed list or is local
      const isAllowed = !origin ||
        allowedOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isAllowed) {
        console.log(`✅ CORS allowed for origin: ${origin || '[none]'}`);
        return callback(null, true);
      }

      // Log blocked origin
      console.warn(`❌ CORS BLOCKED: Origin '${origin}' not in allowed list`);
      console.warn(`📋 Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('CORS policy violation'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-client-version',
      'x-client-platform',
      'Referer',
      'User-Agent',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'sec-fetch-dest',
      'sec-fetch-mode',
      'sec-fetch-site',
      'Accept-Language',
      'Accept-Encoding',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours preflight cache
  });

  // ============================================
  // Global Pipes (Validation)
  // ============================================
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

  // ============================================
  // Swagger Documentation
  // ============================================
  const shouldEnableSwagger =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true';

  if (shouldEnableSwagger) {
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
    expressApp.get('/api-docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.json(document);
    });
  }

  // ============================================
  // Global Route Prefix
  // ============================================
  app.setGlobalPrefix('api');

  // ============================================
  // Initialize NestJS App
  // ============================================
  await app.init();

  // Cache the instance for subsequent invocations
  cachedInstance = {
    app: expressApp,
    isInitialized: true,
  };

  console.log('✅ NestJS app initialized and cached for Vercel');
  return expressApp;
}

/**
 * Vercel Serverless Handler
 * Entry point for all incoming requests
 * 
 * Compatible with:
 * - Vercel Serverless Functions
 * - Express 5+
 * - NestJS 11+
 */
export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    const expressApp = await createApp();

    // Route request through Express/NestJS app
    expressApp(req, res);
  } catch (error) {
    console.error('❌ Error in serverless handler:', error);

    if (!res.headersSent) {
      console.error('📋 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });

      // Add CORS headers to error response so the browser doesn't report it as a CORS error
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'https://yatra-kappa.vercel.app',
        'https://yatra-backend.vercel.app'
      ];

      const isAllowed = !origin ||
        (typeof origin === 'string' && (
          allowedOrigins.includes(origin) ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ));

      if (isAllowed && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }

      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, sec-fetch-dest, sec-fetch-mode, sec-fetch-site');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
