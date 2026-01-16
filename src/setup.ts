import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupApp(app: INestApplication) {
    // Configure body parser limits for large base64 image uploads (20MB)
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(require('express').json({ limit: '20mb' }));
    expressApp.use(require('express').urlencoded({ extended: true, limit: '20mb' }));

    // CORS Configuration
    const corsOrigins = process.env.CORS_ORIGIN?.split(',') || '*';
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
            'Accept-Language',
            'Accept-Encoding',
        ],
        credentials: true,
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

    // API docs JSON endpoint
    app.getHttpAdapter().get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(document);
    });

    // Prefix for all routes
    app.setGlobalPrefix('api');
}
