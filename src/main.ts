import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    rawBody: false,
  });

  // Configure body parser limits for large base64 image uploads (20MB)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(require('express').json({ limit: '20mb' }));
  expressApp.use(require('express').urlencoded({ extended: true, limit: '20mb' }));

  // CORS Configuration
  const rawOrigins = process.env.CORS_ORIGIN;
  const corsOrigins = rawOrigins
    ? rawOrigins.split(',').map(o => o.trim()).filter(Boolean)
    : '*';

  app.enableCors({
    origin: corsOrigins === '*' ? true : corsOrigins,
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
    ],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
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
