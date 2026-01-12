import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1x1 transparent PNG pixel (base64)
const TRACKING_PIXEL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
);

// Record email open
export const trackOpen = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Record the open
        await prisma.emailTracking.create({
            data: {
                message_id: parseInt(messageId),
                event_type: 'open',
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });

        console.log(`📧 Email ${messageId} opened from ${ipAddress}`);

        // Return tracking pixel
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Content-Length', TRACKING_PIXEL.length);
        res.send(TRACKING_PIXEL);
    } catch (error) {
        console.error('Error tracking open:', error);
        // Still return pixel even on error (don't break email display)
        res.setHeader('Content-Type', 'image/png');
        res.send(TRACKING_PIXEL);
    }
};

// Record link click
export const trackClick = async (req: Request, res: Response) => {
    try {
        const { trackingId } = req.params;
        const { url } = req.query;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ message: 'Missing url parameter' });
        }

        // Decode tracking ID (format: base64(messageId))
        const messageId = parseInt(Buffer.from(trackingId, 'base64').toString());

        if (isNaN(messageId)) {
            return res.status(400).json({ message: 'Invalid tracking ID' });
        }

        const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Record the click
        await prisma.emailTracking.create({
            data: {
                message_id: messageId,
                event_type: 'click',
                ip_address: ipAddress,
                user_agent: userAgent,
                link_url: url,
            },
        });

        console.log(`🔗 Link clicked in email ${messageId}: ${url}`);

        // Redirect to original URL
        res.redirect(url);
    } catch (error) {
        console.error('Error tracking click:', error);
        // Redirect anyway, don't break user experience
        const { url } = req.query;
        if (url && typeof url === 'string') {
            res.redirect(url);
        } else {
            res.status(400).json({ message: 'Error tracking click' });
        }
    }
};

// Get tracking stats for an email
export const getTrackingStats = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        // @ts-ignore
        const userId = req.userId;

        // Verify email belongs to user
        const email = await prisma.emailMessage.findFirst({
            where: {
                id: parseInt(messageId),
                account: { user_id: userId },
            },
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Get all tracking events
        const events = await prisma.emailTracking.findMany({
            where: { message_id: parseInt(messageId) },
            orderBy: { tracked_at: 'desc' },
        });

        // Calculate stats
        const opens = events.filter(e => e.event_type === 'open');
        const clicks = events.filter(e => e.event_type === 'click');

        // Get unique IPs for unique opens/clicks
        const uniqueOpenIPs = new Set(opens.map(e => e.ip_address));
        const uniqueClickIPs = new Set(clicks.map(e => e.ip_address));

        // Click URLs
        const clickedUrls = clicks.reduce((acc: any, click) => {
            const url = click.link_url || 'unknown';
            acc[url] = (acc[url] || 0) + 1;
            return acc;
        }, {});

        const stats = {
            total_opens: opens.length,
            unique_opens: uniqueOpenIPs.size,
            first_open: opens.length > 0 ? opens[opens.length - 1].tracked_at : null,
            last_open: opens.length > 0 ? opens[0].tracked_at : null,
            total_clicks: clicks.length,
            unique_clicks: uniqueClickIPs.size,
            clicked_urls: clickedUrls,
            events: events.map(e => ({
                type: e.event_type,
                timestamp: e.tracked_at,
                url: e.link_url,
                ip: e.ip_address,
            })),
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching tracking stats:', error);
        res.status(500).json({ message: 'Error fetching tracking stats' });
    }
};
