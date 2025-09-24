import { Request, Response } from 'express';
import * as callService from './call.service';
import { AuthenticatedRequest } from '../../types';

export const getCall = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const call = await callService.getCall(id);
        if (!call) {
            return res.status(404).json({
                status: 'error',
                error: { code: 'Not Found', message: 'Call not found' },
                status_code: 404,
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Call retrieved successfully',
            data: call,
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error fetching call' },
            status_code: 500,
        });
    }
};

export const getUserContactCallsWithCallerFlag = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
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
        const { contactId } = req.params;
        const calls = await callService.getUserContactCalls(user.userId, contactId);

        const callsWithCallerFlag = calls.map((call: any) => ({
            ...call,
            isCaller: call.callerId === user.userId,
        }));

        return res.status(200).json({
            status: 'success',
            message: 'Calls with contact retrieved successfully',
            data: callsWithCallerFlag,
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: {
                code: 'Internal Server Error',
                message: 'Error fetching calls',
            },
            status_code: 500,
        });
    }
};

export const getAllCalls = async (_req: Request, res: Response) => {
    try {
        const calls = await callService.getAllCalls();
        return res.status(200).json({
            status: 'success',
            message: 'Calls retrieved successfully',
            data: calls,
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error fetching calls' },
            status_code: 500,
        });
    }
};

export const getUserCalls = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            status: 'error',
            error: { code: 'Unauthorized', message: "You don't have access" },
            status_code: 401,
        });
    }
    try {
        const calls = await callService.getUserCalls(user.userId);
        return res.status(200).json({
            status: 'success',
            message: 'Calls retrieved successfully',
            data: calls,
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error fetching user calls' },
            status_code: 500,
        });
    }
};

export const getCallsByCaller = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            status: 'error',
            error: { code: 'Unauthorized', message: "You don't have access" },
            status_code: 401,
        });
    }
    try {
        const calls = await callService.getCallsByCaller(user.userId);
        return res.status(200).json({
            status: 'success',
            message: 'Caller calls retrieved successfully',
            data: calls,
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error fetching caller calls' },
            status_code: 500,
        });
    }
};

export const deleteCall = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            status: 'error',
            error: { code: 'Unauthorized', message: "You don't have access" },
            status_code: 401,
        });
    }

    try {
        const { id } = req.params;

        const existingCall = await callService.getCall(id);
        if (!existingCall) {
            return res.status(404).json({
                status: 'error',
                error: { code: 'Not Found', message: 'Call not found' },
                status_code: 404,
            });
        }

        if (existingCall.callerId !== user.userId && existingCall.receiverId !== user.userId) {
            return res.status(403).json({
                status: 'error',
                error: { code: 'Forbidden', message: 'You do not have permission to delete this call' },
                status_code: 403,
            });
        }

        await callService.deleteCall(id);

        return res.status(200).json({
            status: 'success',
            message: 'Call deleted successfully',
            status_code: 200,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error deleting call' },
            status_code: 500,
        });
    }
};
