import { prisma } from '../lib/prisma';

export class NotificationService {
    /**
     * Creates a notification for a user.
     */
    static async notify(userId: number, message: string, taskId?: number) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    user_id: userId,
                    task_id: taskId,
                    message,
                    is_read: false
                }
            });

            // Note: In a production app, we would emit a Socket.io event here for real-time popups.
            // For now, it's saved in the DB for the persistent history/badge.
            console.log(`Notification created for user ${userId}: ${message}`);
            return notification;
        } catch (error) {
            console.error('Failed to create notification:', error);
            // We don't want to fail the main transaction if notification fails
        }
    }

    /**
     * Marks a notification as read.
     */
    static async markAsRead(notificationId: number) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { is_read: true }
        });
    }

    /**
     * Gets unread notifications for a user.
     */
    static async getUnread(userId: number) {
        return await prisma.notification.findMany({
            where: { user_id: userId, is_read: false },
            orderBy: { created_at: 'desc' }
        });
    }
}
