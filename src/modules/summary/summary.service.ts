import prisma from '../../config/prisma';

const summaryTable = prisma.summary;

export const getSummaryByCallId = async (callId: string) => {
    try {
        return await summaryTable.findUnique({
            where: { callId },
            include: { call: true },
        });
    } catch {
        throw new Error('Error fetching summary');
    }
};

// Call AI HERE
export const createSummary = async (data: { callId: string; content: string }) => {
    try {
        return await summaryTable.create({
            data: {
                callId: data.callId,
                content: data.content,
            },
            include: { call: true },
        });
    } catch {
        throw new Error('Error creating summary');
    }
};

export const deleteSummary = async (callId: string) => {
    try {
        await summaryTable.delete({ where: { callId } });
    } catch {
        throw new Error('Error deleting summary');
    }
};
