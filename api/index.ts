import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';
import express from 'express';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
    setupApp(app);
    await app.init();
    return app;
};

// Global promise to reuse the instance (warm start)
let appPromise: Promise<any>;

export default async (req: any, res: any) => {
    if (!appPromise) {
        appPromise = createNestServer(server);
    }
    await appPromise;
    server(req, res);
};
