'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import callManager from '@/lib/voip/callManager';
import api from '@/lib/api';

export default function VoIPInitializer() {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        initializeVoIP();

        return () => {
            callManager.destroy();
        };
    }, []);

    const initializeVoIP = async () => {
        try {
            // Get default VoIP provider
            const providers = await api.get('/voip/providers');

            if (!providers.data || providers.data.length === 0) {
                console.warn('⚠️  No VoIP providers configured');
                return;
            }

            const activeProvider = providers.data.find((p: any) => p.active) || providers.data[0];

            // Get Twilio token for WebRTC
            const tokenResponse = await api.get('/voip/token', {
                params: { providerId: activeProvider.id }
            });

            if (tokenResponse.data?.token) {
                await callManager.initialize(tokenResponse.data.token);
                setInitialized(true);
                console.log('✅ VoIP initialized successfully');
            }
        } catch (error: any) {
            console.error('❌ Failed to initialize VoIP:', error);

            // Only show error if it's not a "no providers" issue
            if (error.response?.status !== 404) {
                toast.error('VoIP initialization failed. Calling features disabled.');
            }
        }
    };

    // This component doesn't render anything
    return null;
}
