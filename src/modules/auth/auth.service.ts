import prisma from '../../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../email/email.service';
import { generateEmailToken } from '../../utils/generateToken';

const userTable = prisma.user;
const notiSettings = prisma.notificationSettings;

export async function getUsers() {
    try {
        const allUsers = await userTable.findMany();
        return allUsers;
    } catch (error: any) {
        throw new Error(`Error fetching users: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

export async function getSingleUser(userId: string) {
    try {
        const user = await userTable.findUnique({
            where: {
                id: userId,
            },
            include: {
                contacts: true,
            },
        });

        if (!user) {
            throw new Error(`User not found`);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error: any) {
        throw new Error(`Error fetching user: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

export async function verifyUser(email: string, password: string) {
    try {
        const user = await userTable.findUnique({
            where: {
                email: email,
            },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(`Error verifying user: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

export async function createUser(input: CreateUserInput) {
    const { name, email, password } = input;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userTable.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return newUser;
    } catch (error: any) {
        throw new Error(`Error creating user: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

export async function updateUser(userId: string, input: UpdateUserInput) {
    try {
        const updatedUser = await userTable.update({
            where: { id: userId },
            data: input,
            select: {
                id: true,
                name: true,
                email: true,
                updatedAt: true,
            },
        });

        return updatedUser;
    } catch (error: any) {
        throw new Error(`Error updating user: ${error.message}`);
    }
}

export async function updateSecurity(id: string, data: { twoFactorEnabled?: boolean }) {
    try {
        const user = await userTable.update({
            where: {
                id,
            },
            data: data,
        });
    } catch (error: any) {
        throw new Error(`Error updating security setting: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

export async function updateNotification(id: string, data: { missedCallAlert?: boolean; newContactAlert?: boolean; summaryReport?: boolean }) {
    try {
        const user = await notiSettings.update({
            where: {
                userId: id,
            },
            data: data,
        });
    } catch (error: any) {
        throw new Error(`Error updating notification setting: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

export async function changePassword(input: ChangePasswordInput) {
    const { userId, currentPassword, newPassword } = input;

    try {
        const user = await userTable.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userTable.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error: any) {
        throw new Error(`Error changing password: ${error.message}`);
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function sendVerificationEmail(userId: string, email: string) {
    const token = generateEmailToken(userId);
    const verifyUrl = `https://yourapp.com/api/auth/verify-email?token=${token}`;
    const html = `<p>Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 2 hours.</p>`;

    await sendEmail(email, 'Verify Your Email', html);
}

export async function verifyEmail(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) throw new Error('User not found');

        if (user.emailVerified) return;

        await prisma.user.update({
            where: { id: decoded.userId },
            data: { emailVerified: true },
        });
    } catch (err: any) {
        throw new Error('Invalid or expired token');
    }
}

export async function sendPasswordResetEmail(userId: string, email: string) {
    const token = generateEmailToken(userId);
    const verifyUrl = `https://yourapp.com/api/auth/reset-password?token=${token}`;
    const html = `<p>Click <a href="${verifyUrl}">here</a> to reset your password. This link expires in 5 minutes.</p>`;

    await sendEmail(email, 'Reset Your Password', html);
}

export async function resetPassword(token: string, newPassword: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) throw new Error('User not found');

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword },
        });
    } catch (err: any) {
        throw new Error('Invalid or expired token');
    }
}
