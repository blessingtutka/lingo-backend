import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../config/prisma';

export const generateToken = (user: User): string => {
    return jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: '4h',
    });
};

export const generateEmailToken = (userId: string): string => {
    return jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: '2h',
    });
};

export const generatePasswordResetToken = (userId: string): string => {
    return jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: '5min',
    });
};
