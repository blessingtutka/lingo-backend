import prisma from '../../config/prisma';
// import type { Prisma } from '@prisma/client';

const callTable = prisma.call;

export const getCall = async (id: string) => {
    try {
        return await callTable.findUnique({
            where: { id },
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
        });
    } catch {
        throw new Error('Error fetching call');
    }
};

export const getAllCalls = async () => {
    try {
        return await callTable.findMany({
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
            orderBy: { startedAt: 'desc' },
        });
    } catch {
        throw new Error('Error fetching all calls');
    }
};

export const getUserCalls = async (userId: string) => {
    try {
        return await callTable.findMany({
            where: {
                OR: [{ callerId: userId }, { receiverId: userId }],
            },
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
            orderBy: { startedAt: 'desc' },
        });
    } catch {
        throw new Error('Error fetching user calls');
    }
};

export const getUserContactCalls = async (userId: string, contactId: string) => {
    try {
        return await callTable.findMany({
            where: {
                OR: [
                    { callerId: userId, receiverId: contactId },
                    { callerId: contactId, receiverId: userId },
                ],
            },
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
            orderBy: { startedAt: 'desc' },
        });
    } catch {
        throw new Error('Error fetching user-contact calls');
    }
};

export const getCallsByCaller = async (userId: string) => {
    try {
        return await callTable.findMany({
            where: { callerId: userId },
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
            orderBy: { startedAt: 'desc' },
        });
    } catch {
        throw new Error('Error fetching calls where user is caller');
    }
};

export const getCallsByReceiver = async (userId: string) => {
    try {
        return await callTable.findMany({
            where: { receiverId: userId },
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
            orderBy: { startedAt: 'desc' },
        });
    } catch {
        throw new Error('Error fetching calls where user is receiver');
    }
};

export const createCall = async (data: {
    callerId: string;
    receiverId: string;
    startedAt?: Date;
    endedAt?: Date | null;
    peerId: string;
    status: CallStatus;
}) => {
    try {
        return await callTable.create({ data });
    } catch {
        throw new Error('Error creating call');
    }
};

export const updateCall = async (
    id: string,
    data: {
        endedAt?: Date | null;
        status?: CallStatus;
        peerId?: string;
    },
) => {
    try {
        return await callTable.update({
            where: { id },
            data: data,
            include: {
                caller: true,
                receiver: true,
                summary: true,
            },
        });
    } catch (error) {
        console.error('Error updating call:', error);
        throw new Error('Error updating call');
    }
};

export const deleteCall = async (id: string) => {
    try {
        await callTable.delete({ where: { id } });
    } catch {
        throw new Error('Error deleting call');
    }
};
