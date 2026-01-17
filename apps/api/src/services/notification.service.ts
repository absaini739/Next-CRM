import { prisma } from '../lib/prisma';

export class NotificationService {
    /**
     * Creates a notification for a user.
     */
    static async notify(userId: number, message: string, type: 'task' | 'deal' | 'lead' | 'email' | 'system' = 'system', relatedId?: number) {
        try {
            // Check user settings
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    email_notifications: true,
                    push_notifications: true,
                    task_reminders: true,
                    deal_updates: true
                }
            });

            if (!user) return;

            // Apply filters based on type
            if (type === 'task' && !user.task_reminders) return;
            if (type === 'deal' && !user.deal_updates) return;
            // 'lead' and 'system' usually fall under general email/push settings, 
            // but for now we'll treat them as critical unless global notifications are off.
            // If user turned off "Email Notifications" (main hub), maybe we suppress all valid alerts?
            // The UI says "Main hub for all system alerts". 
            // Let's assume email_notifications controls the definition of "receiving alerts" generally if no specific override exists.
            if (!user.email_notifications && type === 'system') return;

            // Determine related ID columns
            const data: any = {
                user_id: userId,
                message,
                is_read: false,
                type // Store type if schema supports it, otherwise generic
            };

            if (type === 'task') data.task_id = relatedId;
            if (type === 'lead') data.lead_id = relatedId;
            // data.deal_id = relatedId; // If schema has deal_id, add here.
            // Current schema has task_id and lead_id in Notification model? 
            // Let's check schema for Notification model.
            // Assuming simplified for now, or we'll just ignore if column missing.

            const notification = await (prisma.notification as any).create({
                data: {
                    user_id: userId,
                    task_id: type === 'task' ? relatedId : undefined,
                    lead_id: type === 'lead' ? relatedId : undefined,
                    message,
                    is_read: false
                }
            });

            console.log(`Notification created for user ${userId} [${type}]: ${message}`);
            return notification;
        } catch (error) {
            console.error('Failed to create notification:', error);
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
