import { Request, Response } from 'express';
import { twilioService } from '../services/voip/twilio.service';
import { prisma } from '../lib/prisma';
import { twiml } from 'twilio';

const VoiceResponse = twiml.VoiceResponse;

/**
 * Generate Twilio token for WebRTC calling
 */
export const getToken = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { providerId } = req.query;

        if (!providerId) {
            return res.status(400).json({ error: 'Provider ID is required' });
        }

        const identity = `user_${userId}`;
        const tokenData = await twilioService.generateToken(
            parseInt(providerId as string),
            identity
        );

        res.json(tokenData);
    } catch (error: any) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: error.message || 'Failed to generate token' });
    }
};

/**
 * Initiate an outbound call
 */
export const initiateCall = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { providerId, to, from } = req.body;

        if (!providerId || !to) {
            return res.status(400).json({ error: 'Provider ID and phone number are required' });
        }

        const result = await twilioService.makeCall(
            providerId,
            from,
            to,
            userId
        );

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error initiating call:', error);
        res.status(500).json({ error: error.message || 'Failed to initiate call' });
    }
};

/**
 * End an active call
 */
export const endCall = async (req: Request, res: Response) => {
    try {
        const { callSid } = req.params;

        await twilioService.endCall(callSid);

        res.json({ message: 'Call ended successfully' });
    } catch (error: any) {
        console.error('Error ending call:', error);
        res.status(500).json({ error: error.message || 'Failed to end call' });
    }
};

/**
 * Get call history
 */
export const getCallHistory = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { page = 1, limit = 20, direction, status } = req.query;

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        let whereClause = 'WHERE user_id = $1';
        const params: any[] = [userId];
        let paramIndex = 2;

        if (direction) {
            whereClause += ` AND direction = $${paramIndex++}`;
            params.push(direction);
        }

        if (status) {
            whereClause += ` AND status = $${paramIndex++}`;
            params.push(status);
        }

        const calls = await prisma.$queryRawUnsafe(`
            SELECT * FROM call_logs
            ${whereClause}
            ORDER BY started_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex}
        `, ...params, parseInt(limit as string), offset);

        const totalResult = await prisma.$queryRawUnsafe<any[]>(`
            SELECT COUNT(*) as count FROM call_logs ${whereClause}
        `, ...params.slice(0, paramIndex - 2));

        const total = parseInt(totalResult[0]?.count || '0');

        res.json({
            calls,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({ error: 'Failed to fetch call history' });
    }
};

/**
 * Get specific call details
 */
export const getCallDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const call = await prisma.$queryRawUnsafe<any[]>(`
            SELECT cl.*, p.name as person_name, l.title as lead_title
            FROM call_logs cl
            LEFT JOIN persons p ON cl.person_id = p.id
            LEFT JOIN leads l ON cl.lead_id = l.id
            WHERE cl.id = $1
        `, parseInt(id));

        if (!call || call.length === 0) {
            return res.status(404).json({ error: 'Call not found' });
        }

        res.json(call[0]);
    } catch (error) {
        console.error('Error fetching call details:', error);
        res.status(500).json({ error: 'Failed to fetch call details' });
    }
};

/**
 * TwiML endpoint for outbound calls
 */
export const outboundTwiML = async (req: Request, res: Response) => {
    const twiml = new VoiceResponse();

    // Simple dial - connect the call
    twiml.dial({
        callerId: req.body.From || req.query.From,
    }, req.body.To || req.query.To);

    res.type('text/xml');
    res.send(twiml.toString());
};

/**
 * Webhook for call status updates
 */
export const statusWebhook = async (req: Request, res: Response) => {
    try {
        const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;

        console.log('📞 Call status update:', { CallSid, CallStatus, CallDuration });

        await twilioService.updateCallStatus(
            CallSid,
            CallStatus,
            CallDuration ? parseInt(CallDuration) : undefined,
            RecordingUrl
        );

        res.sendStatus(200);
    } catch (error) {
        console.error('Error processing status webhook:', error);
        res.sendStatus(500);
    }
};
