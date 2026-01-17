"use strict";
/**
 * Vercel Serverless Entry Point for NestJS Application
 *
 * This file exports a serverless handler function that wraps the NestJS application
 * for deployment on Vercel's serverless platform.
 *
 * The handler initializes the NestJS app once and reuses it for subsequent requests
 * to minimize cold start times.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("../src/app.module");
const express = __importStar(require("express"));
// Cache the NestJS app instance to reuse across invocations
let cachedApp;
/**
 * Initialize and configure the NestJS application
 * This function is called once and the app instance is cached
 */
async function createApp() {
    if (cachedApp) {
        return cachedApp;
    }
    const expressApp = express();
    const adapter = new platform_express_1.ExpressAdapter(expressApp);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter, {
        bodyParser: true,
        rawBody: false,
    });
    // Configure body parser limits for large base64 image uploads (20MB)
    expressApp.use(express.json({ limit: '20mb' }));
    expressApp.use(express.urlencoded({ extended: true, limit: '20mb' }));
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Swagger Documentation (only in non-production or if explicitly enabled)
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Yatra Event Management System API')
            .setDescription('Backend API for managing pilgrimage events, accommodations, and participant registrations')
            .setVersion('2.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'bearerAuth')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api-docs', app, document, {
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
async function handler(req, res) {
    const app = await createApp();
    return app(req, res);
}
//# sourceMappingURL=index.js.map