/**
 * Twilio Voice Service
 * Handles all Twilio API interactions for voice calls
 */

import twilio from 'twilio';
import { jwt } from 'twilio';
import { prisma } from '../../lib/prisma';

const AccessToken = jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export class TwilioService {
    /**
     * Get Twilio client for a specific provider
     */
    private async getClient(providerId: number) {
        const provider = await prisma.voipProvider.findUnique({
            where: { id: providerId, active: true }
        });

        if (!provider) {
            throw new Error('VoIP provider not found or inactive');
        }

        if (provider.provider_type !== 'twilio') {
            throw new Error('Provider is not a Twilio provider');
        }

        if (!provider.account_sid || !provider.auth_token) {
            throw new Error('Twilio credentials not configured');
        }

        return {
            client: twilio(provider.account_sid, provider.auth_token),
            provider
        };
    }

    /**
     * Initiate an outbound call
     */
    async makeCall(providerId: number, from: string, to: string, userId?: number) {
        const { client, provider } = await this.getClient(providerId);

        const API_URL = process.env.API_URL || 'http://localhost:3001';

        try {
            const call = await client.calls.create({
                from: from || provider.from_number,
                to: to,
                url: `${API_URL}/voip/twiml/outbound`,
                statusCallback: `${API_URL}/voip/webhooks/status`,
                statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
                record: true, // Enable call recording
            });

            // Create call log
            const callLog = await prisma.$executeRawUnsafe(`
                INSERT INTO call_logs (
                    call_sid, provider_id, direction, from_number, to_number, 
                    user_id, status, started_at
                )
                VALUES ($1, $2, 'outbound', $3, $4, $5, 'initiated', NOW())
                RETURNING *
            `, call.sid, providerId, from, to, userId || null);

            return {
                callSid: call.sid,
                status: call.status,
                direction: 'outbound',
            };
        } catch (error) {
            console.error('Error making call:', error);
            throw new Error('Failed to initiate call');
        }
    }

    /**
     * Generate access token for WebRTC calling
     */
    async generateToken(providerId: number, identity: string) {
        const provider = await prisma.voipProvider.findUnique({
            where: { id: providerId, active: true }
        });

        if (!provider) {
            throw new Error('VoIP provider not found');
        }

        if (!provider.account_sid || !provider.api_key_sid || !provider.api_key_secret) {
            throw new Error('Twilio API credentials not configured');
        }

        const token = new AccessToken(
            provider.account_sid,
            provider.api_key_sid,
            provider.api_key_secret,
            { identity, ttl: 3600 } // 1 hour expiry
        );

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: provider.twiml_app_sid,
            incomingAllow: true,
        });

        token.addGrant(voiceGrant);

        return {
            token: token.toJwt(),
            identity,
            expiresAt: new Date(Date.now() + 3600 * 1000),
        };
    }

    /**
     * End an active call
     */
    async endCall(callSid: string) {
        // Find the call log to get provider
        const callLog = await prisma.$queryRawUnsafe<any[]>(`
            SELECT provider_id FROM call_logs WHERE call_sid = $1
        `, callSid);

        if (!callLog || callLog.length === 0) {
            throw new Error('Call not found');
        }

        const { client } = await this.getClient(callLog[0].provider_id);

        await client.calls(callSid).update({ status: 'completed' });

        // Update call log
        await prisma.$executeRawUnsafe(`
            UPDATE call_logs 
            SET status = 'completed', ended_at = NOW(), updated_at = NOW()
            WHERE call_sid = $1
        `, callSid);

        return { success: true };
    }

    /**
     * Update call status from webhook
     */
    async updateCallStatus(callSid: string, status: string, duration?: number, recordingUrl?: string) {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        updates.push(`status = $${paramIndex++}`);
        values.push(status);

        if (status === 'answered' && !duration) {
            updates.push(`answered_at = NOW()`);
        }

        if (status === 'completed') {
            updates.push(`ended_at = NOW()`);
            if (duration !== undefined) {
                updates.push(`duration = $${paramIndex++}`);
                values.push(duration);
            }
        }

        if (recordingUrl) {
            updates.push(`recording_url = $${paramIndex++}`);
            values.push(recordingUrl);
        }

        updates.push(`updated_at = NOW()`);
        values.push(callSid);

        const query = `
            UPDATE call_logs 
            SET ${updates.join(', ')}
            WHERE call_sid = $${paramIndex}
        `;

        await prisma.$executeRawUnsafe(query, ...values);
    }

    /**
     * Get call recordings
     */
    async getRecordings(callSid: string) {
        const { client } = await this.getClient(1); // TODO: Get provider from call log

        const recordings = await client.recordings.list({ callSid, limit: 20 });

        return recordings.map(rec => ({
            sid: rec.sid,
            duration: rec.duration,
            url: `https://api.twilio.com${rec.uri.replace('.json', '.mp3')}`,
            dateCreated: rec.dateCreated,
        }));
    }
}

export const twilioService = new TwilioService();
