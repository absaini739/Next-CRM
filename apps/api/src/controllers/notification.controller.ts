import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { NotificationService } from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const count = await prisma.notification.count({
            where: { user_id: userId, is_read: false }
        });

        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching unread count' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const notification = await prisma.notification.updateMany({
            where: { id, user_id: userId },
            data: { is_read: true }
        });

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating notification' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        await prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
};
