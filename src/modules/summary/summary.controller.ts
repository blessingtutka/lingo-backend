import { Request, Response } from 'express';
import * as summaryService from './summary.service';
import { AuthenticatedRequest } from '../../types';

export const getSummaryByCallId = async (req: Request, res: Response) => {
    try {
        const { callId } = req.params;
        const summary = await summaryService.getSummaryByCallId(callId);

        if (!summary) {
            return res.status(404).json({
                status: 'error',
                error: { code: 'Not Found', message: 'Summary not found' },
                status_code: 404,
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Summary retrieved successfully',
            data: summary,
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error fetching summary' },
            status_code: 500,
        });
    }
};

export const createSummary = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            status: 'error',
            error: { code: 'Unauthorized', message: "You don't have access" },
            status_code: 401,
        });
    }

    try {
        const { callId, content } = req.body;

        if (!callId || !content) {
            return res.status(400).json({
                status: 'error',
                error: { code: 'Bad Request', message: 'Call ID and content are required' },
                status_code: 400,
            });
        }

        const summary = await summaryService.createSummary({ callId, content });

        return res.status(201).json({
            status: 'success',
            message: 'Summary created successfully',
            data: summary,
            status_code: 201,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error creating summary' },
            status_code: 500,
        });
    }
};

export const deleteSummary = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            status: 'error',
            error: { code: 'Unauthorized', message: "You don't have access" },
            status_code: 401,
        });
    }

    try {
        const { callId } = req.params;
        await summaryService.deleteSummary(callId);

        return res.status(200).json({
            status: 'success',
            message: 'Summary deleted successfully',
            status_code: 200,
        });
    } catch {
        return res.status(500).json({
            status: 'error',
            error: { code: 'Internal Server Error', message: 'Error deleting summary' },
            status_code: 500,
        });
    }
};
