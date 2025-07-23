import { Request, Response } from 'express';
import { createUser, verifyUser, getSingleUser, updateUser, changePassword } from './auth.service';
import { validateLogin, validateUser, validatePasswordChange, validateUserUpdate } from '../utils/validations';
import { generateToken } from '../utils/generateToken';
import { AuthenticatedRequest } from '../interfaces/interfaces';

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

async function register(req: UserRequest, res: Response) {
    const { name, email, password } = req.body;
    const errors = await validateUser(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        const user = await createUser({ name, email, password });
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

async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    const errors = validateLogin(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        const user = await verifyUser(email, password);

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

async function userProfile(req: AuthenticatedRequest, res: Response) {
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
        const user = await getSingleUser(currentUser?.userId);
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

async function updateUserProfile(req: AuthenticatedRequest & UpdateUserRequest, res: Response) {
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

    const errors = await validateUserUpdate(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        const updatedUser = await updateUser(currentUser.userId, { name, email });

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

async function changeUserPassword(req: AuthenticatedRequest & ChangePasswordRequest, res: Response) {
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

    const errors = validatePasswordChange(req.body);
    if (errors.length > 0) return res.status(422).json({ errors });

    try {
        await changePassword({
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

export { register, login, userProfile, updateUserProfile, changeUserPassword };
