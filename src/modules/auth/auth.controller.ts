import { Request, Response } from 'express';
import * as authService from './auth.service';
import * as validation from '../../utils/validations';
import { generateToken } from '../../utils/generateToken';
import { AuthenticatedRequest } from '../../types';
import prisma from '../../config/prisma';

interface UserRequest extends Request {
    body: {
        name: string;
        email: string;
        password: string;
    };
    params: {
        userId: string;
    };
}

interface UpdateUserRequest extends Request {
    body: {
        name?: string;
        email?: string;
    };
}

interface ChangePasswordRequest extends Request {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}

export interface updateSecuriyRequest extends Request {
    body: {
        twoFactorEnabled: boolean;
    };
}
export interface updateNotificationRequest extends Request {
    body: {
        missedCallAlert: boolean;
        newContactAlert: boolean;
        summaryReport: boolean;
    };
}

export async function register(req: UserRequest, res: Response) {
    const { name, email, password } = req.body;
    const errors = await validation.validateUser(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        const user = await authService.createUser({ name, email, password });
        const token = generateToken(user);
        const response = {
            status: 'success',
            message: 'Registration successful',
            data: {
                accessToken: token,
                user: user,
            },
        };
        return res.status(201).json(response);
    } catch (error) {
        const responseError = {
            status: 'error',
            error: {
                code: 'Bad Request',
                message: 'Registration unsuccessful',
            },

            status_code: 400,
        };
        return res.status(responseError.status_code).json(responseError);
    }
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    const errors = validation.validateLogin(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        const user = await authService.verifyUser(email, password);

        if (user) {
            const token = generateToken(user);
            const response = {
                status: 'success',
                message: 'Login successful',
                data: {
                    accessToken: token,
                    user: user,
                },
            };
            return res.status(200).json(response);
        } else {
            const responseError = {
                status: 'error',
                error: {
                    code: 'Bad Request',
                    message: 'Bad Credential',
                },
                status_code: 400,
            };
            return res.status(responseError.status_code).json(responseError);
        }
    } catch (error) {
        const responseError = {
            status: 'error',
            error: {
                code: 'Bad Request',
                message: 'Authentication failed',
            },
            status_code: 400,
        };
        return res.status(responseError.status_code).json(responseError);
    }
}

export async function userProfile(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user;

    if (!currentUser) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: "You don't have access",
            },
            status_code: 401,
        });
    }

    try {
        const user = await authService.getSingleUser(currentUser?.userId);
        if (user) {
            const response = {
                status: 'success',
                message: 'User found',
                data: user,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({
                status: 'error',
                error: { code: 'Not Found', message: "This user doesn't exist" },
                status_code: 404,
            });
        }
    } catch (error: any) {
        const responseError = {
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Errer Getting Your User Profile',
            },
            status_code: 500,
        };
        return res.status(responseError.status_code).json(responseError);
    }
}

export async function updateUserProfile(req: AuthenticatedRequest & UpdateUserRequest, res: Response) {
    const currentUser = req.user;
    const { name, email } = req.body;

    if (!currentUser) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: "You don't have access",
            },
            status_code: 401,
        });
    }

    const errors = await validation.validateUserUpdate(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        const updatedUser = await authService.updateUser(currentUser.userId, { name, email });

        return res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: error.message || 'Failed to update profile',
            },
            status_code: 400,
        });
    }
}

export async function changeUserPassword(req: AuthenticatedRequest & ChangePasswordRequest, res: Response) {
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentUser) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: "You don't have access",
            },
            status_code: 401,
        });
    }

    const errors = validation.validatePasswordChange(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        await authService.changePassword({
            userId: currentUser.userId,
            currentPassword,
            newPassword,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: error.message || 'Failed to change password',
            },
            status_code: 400,
        });
    }
}

export async function updateUserSecuritySetting(req: AuthenticatedRequest & updateSecuriyRequest, res: Response) {
    const currentUser = req.user;
    const { twoFactorEnabled } = req.body;

    if (!currentUser) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: "You don't have access",
            },
            status_code: 401,
        });
    }

    try {
        await authService.updateSecurity(currentUser.userId, { twoFactorEnabled });

        return res.status(200).json({
            status: 'success',
            message: 'Security setting updated successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: error.message || 'Failed to update security setting',
            },
            status_code: 400,
        });
    }
}

export async function updateUserNotificationSetting(req: AuthenticatedRequest & updateNotificationRequest, res: Response) {
    const currentUser = req.user;
    const { newContactAlert, summaryReport, missedCallAlert } = req.body;

    if (!currentUser) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: "You don't have access",
            },
            status_code: 401,
        });
    }

    try {
        await authService.updateNotification(currentUser.userId, { newContactAlert, summaryReport, missedCallAlert });

        return res.status(200).json({
            status: 'success',
            message: 'Notification setting updated successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: error.message || 'Failed to update notification setting',
            },
            status_code: 400,
        });
    }
}

export async function requestEmailVerification(req: Request, res: Response) {
    const user = (req as any).user;

    if (!user?.userId) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: 'You must be logged in',
            },
            status_code: 401,
        });
    }

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
        });

        if (!dbUser) {
            return res.status(404).json({
                status: 'error',
                error: {
                    code: 'Not Found',
                    message: 'User does not exist',
                },
                status_code: 404,
            });
        }

        if (dbUser.emailVerified) {
            return res.status(200).json({
                status: 'success',
                message: 'Email already verified',
                data: null,
            });
        }

        await authService.sendVerificationEmail(dbUser.id, dbUser.email);

        return res.status(200).json({
            status: 'success',
            message: 'Verification email sent successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: error.message || 'Could not send verification email',
            },
            status_code: 500,
        });
    }
}

export async function verifyEmail(req: Request, res: Response) {
    const token = req.query.token as string;

    if (!token) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: 'Token is required',
            },
            status_code: 400,
        });
    }

    try {
        await authService.verifyEmail(token);

        return res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: error.message || 'Failed to verify email',
            },
            status_code: 400,
        });
    }
}

export async function requestPasswordReset(req: Request, res: Response) {
    const user = (req as any).user;

    if (!user?.userId) {
        return res.status(401).json({
            status: 'error',
            error: {
                code: 'Unauthorized',
                message: 'You must be logged in',
            },
            status_code: 401,
        });
    }

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
        });

        if (!dbUser) {
            return res.status(404).json({
                status: 'error',
                error: {
                    code: 'Not Found',
                    message: 'User does not exist',
                },
                status_code: 404,
            });
        }

        await authService.sendPasswordResetEmail(dbUser.id, dbUser.email);

        return res.status(200).json({
            status: 'success',
            message: 'password reset email sent successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: error.message || 'Could not send password reset email',
            },
            status_code: 500,
        });
    }
}

export async function resetPassword(req: Request, res: Response) {
    const token = req.body.token || req.query.token;
    const { newPassword } = req.body;

    if (!token) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: 'Token is required',
            },
            status_code: 400,
        });
    }

    try {
        await authService.resetPassword(token, newPassword);

        return res.status(200).json({
            status: 'success',
            message: 'Password Reset successfully',
            data: null,
        });
    } catch (error: any) {
        return res.status(400).json({
            status: 'error',
            error: {
                code: 'Bad Request',
                message: error.message || 'Failed to reset password',
            },
            status_code: 400,
        });
    }
}
