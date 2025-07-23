import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

const userTable = prisma.user;

async function getUsers() {
    try {
        const allUsers = await userTable.findMany();
        return allUsers;
    } catch (error: any) {
        throw new Error(`Error fetching users: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function getSingleUser(userId: string) {
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

async function verifyUser(email: string, password: string) {
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

async function createUser(input: CreateUserInput) {
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

async function updateUser(userId: string, input: UpdateUserInput) {
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

async function changePassword(input: ChangePasswordInput) {
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

export default getUsers;
export { createUser, getSingleUser, verifyUser, updateUser, changePassword };
