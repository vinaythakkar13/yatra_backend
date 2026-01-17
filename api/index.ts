import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';
import express, { Request, Response } from 'express';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
    try {
        console.log('Creating NestJS application...');
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(expressInstance),
            { logger: ['error', 'warn', 'log'] }
        );

        console.log('Setting up application...');
        setupApp(app);

        console.log('Initializing application...');
        await app.init();

        console.log('NestJS application ready!');
        return app;
    } catch (error) {
        console.error('Error creating NestJS application:', error);
        throw error;
    }
};

// Global promise to reuse the instance (warm start)
let appPromise: Promise<any> | null = null;

export default async (req: Request, res: Response) => {
    try {
        if (!appPromise) {
            console.log('Cold start - initializing NestJS application...');
            appPromise = createNestServer(server);
        }

        await appPromise;
        server(req, res);
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
