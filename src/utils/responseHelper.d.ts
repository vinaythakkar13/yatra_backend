import { Response } from 'express';

export function successResponse(res: Response, data?: any, message?: string, statusCode?: number): Response;
export function errorResponse(res: Response, message?: string, statusCode?: number, errors?: any): Response;
export function paginatedResponse(res: Response, data: any[], pagination: any, message?: string): Response;
export function validationErrorResponse(res: Response, errors: any[]): Response;
export function notFoundResponse(res: Response, message?: string): Response;
export function unauthorizedResponse(res: Response, message?: string): Response;
export function forbiddenResponse(res: Response, message?: string): Response;

