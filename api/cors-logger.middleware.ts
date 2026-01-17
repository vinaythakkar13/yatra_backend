import { Request, Response, NextFunction } from 'express';

export function corsLogger(req: Request, res: Response, next: NextFunction) {
    console.log('🔹 METHOD:', req.method);
    console.log('🔹 URL:', req.originalUrl);
    console.log('🔹 ORIGIN:', req.headers.origin);
    console.log('🔹 HOST:', req.headers.host);
    console.log('🔹 USER-AGENT:', req.headers['user-agent']);
    next();
}
