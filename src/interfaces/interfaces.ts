import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export interface AuthenticatedEmployerBodyRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
