import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all call recordings
export const getAllRecordings = async (req: Request, res: Response) => {
    try {
        const { direction, user_id, from_date, to_date } = req.query;

        const where: any = {};

        if (direction) {
            where.direction = direction;
        }

        if (user_id) {
            where.user_id = parseInt(user_id as string);
        }

        if (from_date || to_date) {
            where.created_at = {};
            if (from_date) {
                where.created_at.gte = new Date(from_date as string);
            }
            if (to_date) {
                where.created_at.lte = new Date(to_date as string);
            }
        }

        const recordings = await prisma.callRecording.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(recordings);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).json({ error: 'Failed to fetch call recordings' });
    }
};

// Get single call recording
export const getRecordingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const recording = await prisma.callRecording.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!recording) {
            return res.status(404).json({ error: 'Call recording not found' });
        }

        res.json(recording);
    } catch (error) {
        console.error('Error fetching call recording:', error);
        res.status(500).json({ error: 'Failed to fetch call recording' });
    }
};
