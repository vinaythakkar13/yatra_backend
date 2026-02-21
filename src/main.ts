import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    rawBody: false,
  });

  // 1. ABSOLUTE ENTRY LEVEL LOGGER (Before anything else)
  app.use((req: any, res: any, next: any) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`\n--- [ENTRY] ${req.method} ${req.url} ---`);
    console.log(`IP: ${ip} | Origin: ${req.headers.origin || 'No Origin'}`);
    if (req.method === 'OPTIONS') {
      console.log('Preflight Request Headers:', JSON.stringify(req.headers, null, 2));
    }
    next();
  });

  // Configure body parser limits for large base64 image uploads (20MB)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(require('express').json({ limit: '20mb' }));
  expressApp.use(require('express').urlencoded({ extended: true, limit: '20mb' }));

  // CORS Configuration
  const rawOrigins = process.env.CORS_ORIGIN;
  const corsOrigins = rawOrigins
    ? rawOrigins.split(',').map(o => o.trim()).filter(Boolean)
    : [];

  const allowedPatterns = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5001',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',
    /^http:\/\/192\.168\.\d+\.\d+(:[0-9]+)?$/, // 192.168.x.x
    /^http:\/\/10\.\d+\.\d+\.\d+(:[0-9]+)?$/,    // 10.x.x.x
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:[0-9]+)?$/, // 172.16.x.x to 172.31.x.x
    /\.ngrok-free\.app$/,
    ...corsOrigins,
  ];

  console.log('\n--- CORS CONFIGURATION ---');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Static Allowed Origins:', corsOrigins);
  console.log('--------------------------\n');

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like curl or mobile apps or same-origin)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedPatterns.some(pattern => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return pattern === origin || pattern === `${origin}/`;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS REJECTED] Origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
      'sec-fetch-user',
      'Accept-Language',
      'Accept-Encoding',
      'ngrok-skip-browser-warning',
    ],
    credentials: true,
    maxAge: 86400,
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

  // Global interceptors and filters are registered in AppModule providers

  // Swagger Documentation
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

  // Prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
