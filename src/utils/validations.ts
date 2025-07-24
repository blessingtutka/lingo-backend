import prisma, { User } from '../config/prisma';
interface ValidationError {
    field: string;
    message: string;
}

interface UserInput {
    email: string;
    name: string;
    password: string;
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const userwithemail = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        return userwithemail;
    } catch {
        return null;
    }
};

export const validateUser = async (user: UserInput): Promise<ValidationError[]> => {
    const exists = await getUserByEmail(user.email);

    const errors: ValidationError[] = [];
    if (!user.email) errors.push({ field: 'email', message: 'Email is required' });
    if (!user.name) errors.push({ field: 'name', message: 'Full name is required' });
    if (exists) errors.push({ field: 'email', message: 'Email already exists' });
    return errors;
};

export const validateLogin = (user: Partial<UserInput>): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!user.email) errors.push({ field: 'email', message: 'Email is required' });
    if (!user.password) errors.push({ field: 'password', message: 'Password is required' });
    return errors;
};

export function validatePasswordChange(data: { currentPassword: string; newPassword: string }): string[] {
    const errors: string[] = [];

    if (!data.currentPassword) {
        errors.push('Current password is required');
    }

    if (!data.newPassword) {
        errors.push('New password is required');
    } else if (data.newPassword.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    return errors;
}

export async function validateUserUpdate(data: { name?: string; email?: string }): Promise<string[]> {
    const errors: string[] = [];

    if (data.name && data.name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (data.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email is invalid');
        }
    }

    return errors;
}
