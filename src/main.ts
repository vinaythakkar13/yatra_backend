import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    rawBody: false,
    logger: ['error', 'warn'],
  });

  // ============================================================
  // 🔍 RAW REQUEST LOGGER — logs EVERY request before anything else
  // This runs before CORS, before validation, before everything.
  // If a request doesn't appear here, it never reached NestJS.
  // ============================================================
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use((req: any, res: any, next: any) => {
    const now = new Date().toISOString();
    console.log('\n─────────────────────────────────────────');
    console.log(`📥 [${now}] INCOMING REQUEST`);
    console.log(`   Method  : ${req.method}`);
    console.log(`   URL     : ${req.url}`);
    console.log(`   Origin  : ${req.headers['origin'] || '⚠️  No Origin header'}`);
    console.log(`   Host    : ${req.headers['host']}`);
    console.log(`   Referer : ${req.headers['referer'] || 'none'}`);
    console.log(`   UA      : ${req.headers['user-agent']}`);
    console.log(`   IP      : ${req.ip || req.connection?.remoteAddress}`);
    console.log('─────────────────────────────────────────\n');
    next();
  });

  // Configure body parser limits for large base64 image uploads (20MB)
  expressApp.use(require('express').json({ limit: '20mb' }));
  expressApp.use(require('express').urlencoded({ extended: true, limit: '20mb' }));

  // ============================================================
  // ⚠️  TEMPORARY: Allow all origins — revert before production
  // ============================================================
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log(`🌐 [CORS] Origin received: "${origin || 'NO ORIGIN'}"`);
      callback(null, true); // Allow everything
    },
    credentials: true,
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

  app.getHttpAdapter().get('/api-docs.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);

  const isPreview = process.env.NODE_ENV === 'preview' || process.env.NODE_ENV === 'development';
  const suffix = isPreview ? '_PREVIEW' : '';
  const dbName = process.env[`DB_NAME${suffix}`] || process.env.DB_NAME || 'yatra_db';

  console.log(`\n✅ Database [${dbName}] connected successfully`);
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs\n`);
  console.log(`🔍 Request logger ACTIVE — watching all incoming traffic\n`);
}

bootstrap();