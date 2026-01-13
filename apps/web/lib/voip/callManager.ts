/**
 * VoIP Call Manager
 * Handles WebRTC calling using Twilio Voice SDK
 */

import { Device, Call } from '@twilio/voice-sdk';
import { toast } from 'sonner';

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'active' | 'ended';

export interface CallState {
    status: CallStatus;
    phoneNumber: string | null;
    duration: number;
    isMuted: boolean;
    isOnHold: boolean;
    callSid: string | null;
}

class CallManager {
    private device: Device | null = null;
    private currentCall: Call | null = null;
    private callState: CallState = {
        status: 'idle',
        phoneNumber: null,
        duration: 0,
        isMuted: false,
        isOnHold: false,
        callSid: null,
    };
    private listeners: Array<(state: CallState) => void> = [];
    private durationInterval: NodeJS.Timeout | null = null;

    /**
     * Initialize the Voice SDK with a Twilio token
     */
    async initialize(token: string): Promise<void> {
        try {
            this.device = new Device(token, {
                logLevel: 1, // Info level logging
                codecPreferences: ['opus', 'pcmu'],
            });

            this.setupEventListeners();

            await this.device.register();

            console.log('✅ Voice device registered and ready');
            toast.success('Phone ready to make calls');
        } catch (error) {
            console.error('❌ Error initializing device:', error);
            toast.error('Failed to initialize phone');
            throw error;
        }
    }

    /**
     * Setup event listeners for the device and calls
     */
    private setupEventListeners(): void {
        if (!this.device) return;

        this.device.on('registered', () => {
            console.log('Device registered');
        });

        this.device.on('error', (error) => {
            console.error('Device error:', error);
            toast.error(`Phone error: ${error.message}`);
        });

        this.device.on('incoming', (call: Call) => {
            console.log('📞 Incoming call from:', call.parameters.From);
            this.handleIncomingCall(call);
        });
    }

    /**
     * Make an outbound call
     */
    async makeCall(phoneNumber: string): Promise<void> {
        try {
            if (this.currentCall && this.currentCall.status() !== 'closed') {
                throw new Error('Already on a call');
            }

            this.updateState({
                status: 'connecting',
                phoneNumber,
                duration: 0,
            });

            toast.info(`Calling ${phoneNumber}... (Simulated)`);

            // If device is not initialized, simulate the call flow
            if (!this.device) {
                console.log('⚠️ Device not initialized, running in MOCK mode');

                // Simulate ringing
                setTimeout(() => {
                    this.updateState({ status: 'ringing' });
                }, 1000);

                // Simulate connected
                setTimeout(() => {
                    this.updateState({ status: 'active' });
                    this.startDurationCounter();
                    toast.success('Call connected (Simulated)');
                }, 3000);

                return;
            }

            // Real call logic
            this.currentCall = await this.device.connect({
                params: { To: phoneNumber }
            });

            this.setupCallListeners(this.currentCall);

        } catch (error: any) {
            console.error('Error making call:', error);
            toast.error(error.message || 'Failed to make call');
            this.updateState({ status: 'idle', phoneNumber: null });
            throw error;
        }
    }

    /**
     * Handle incoming call
     */
    private handleIncomingCall(call: Call): void {
        this.currentCall = call;
        const from = call.parameters.From;

        this.updateState({
            status: 'ringing',
            phoneNumber: from,
        });

        toast.info(`Incoming call from ${from}`, {
            duration: 10000,
            action: {
                label: 'Answer',
                onClick: () => this.answerCall(),
            },
        });

        this.setupCallListeners(call);
    }

    /**
     * Answer an incoming call
     */
    answerCall(): void {
        if (this.currentCall) {
            this.currentCall.accept();
            toast.success('Call answered');
        }
    }

    /**
     * End the current call
     */
    endCall(): void {
        if (!this.device) {
            // Mock mode end call
            console.log('Ending mock call');
            this.stopDurationCounter();
            this.updateState({
                status: 'ended',
                duration: 0,
                isMuted: false,
                isOnHold: false,
            });
            toast.info('Call ended');

            setTimeout(() => {
                this.updateState({
                    status: 'idle',
                    phoneNumber: null,
                    callSid: null,
                });
            }, 2000);
            return;
        }

        if (this.currentCall) {
            this.currentCall.disconnect();
        }
    }

    /**
     * Toggle mute
     */
    toggleMute(): boolean {
        if (this.currentCall) {
            const isMuted = this.currentCall.isMuted();
            this.currentCall.mute(!isMuted);

            this.updateState({ isMuted: !isMuted });
            toast.info(!isMuted ? 'Muted' : 'Unmuted');

            return !isMuted;
        }
        return false;
    }

    /**
     * Send DTMF tones (dial pad during call)
     */
    sendDigits(digits: string): void {
        if (this.currentCall) {
            this.currentCall.sendDigits(digits);
        }
    }

    /**
     * Setup call event listeners
     */
    private setupCallListeners(call: Call): void {
        call.on('accept', () => {
            console.log('Call accepted');
            this.updateState({ status: 'active' });
            this.startDurationCounter();
            toast.success('Call connected');
        });

        call.on('disconnect', () => {
            console.log('Call ended');
            this.stopDurationCounter();
            this.updateState({
                status: 'ended',
                duration: 0,
                isMuted: false,
                isOnHold: false,
            });
            toast.info('Call ended');

            // Reset to idle after a short delay
            setTimeout(() => {
                this.updateState({
                    status: 'idle',
                    phoneNumber: null,
                    callSid: null,
                });
            }, 2000);

            this.currentCall = null;
        });

        call.on('cancel', () => {
            console.log('Call canceled');
            this.stopDurationCounter();
            toast.info('Call canceled');
            this.updateState({
                status: 'idle',
                phoneNumber: null,
            });
        });

        call.on('reject', () => {
            console.log('Call rejected');
            toast.info('Call rejected');
            this.updateState({
                status: 'idle',
                phoneNumber: null,
            });
        });

        call.on('error', (error) => {
            console.error('Call error:', error);
            toast.error(`Call error: ${error.message}`);
            this.stopDurationCounter();
            this.updateState({
                status: 'idle',
                phoneNumber: null,
            });
        });

        // Store call SID
        if (call.parameters.CallSid) {
            this.updateState({ callSid: call.parameters.CallSid });
        }
    }

    /**
     * Start duration counter
     */
    private startDurationCounter(): void {
        this.durationInterval = setInterval(() => {
            this.updateState({
                duration: this.callState.duration + 1,
            });
        }, 1000);
    }

    /**
     * Stop duration counter
     */
    private stopDurationCounter(): void {
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
            this.durationInterval = null;
        }
    }

    /**
     * Update state and notify listeners
     */
    private updateState(updates: Partial<CallState>): void {
        this.callState = { ...this.callState, ...updates };
        this.notifyListeners();
    }

    /**
     * Subscribe to call state changes
     */
    subscribe(listener: (state: CallState) => void): () => void {
        this.listeners.push(listener);
        listener(this.callState); // Send current state immediately

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners of state change
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.callState));
    }

    /**
     * Get current call state
     */
    getState(): CallState {
        return { ...this.callState };
    }

    /**
     * Cleanup and disconnect device
     */
    destroy(): void {
        this.stopDurationCounter();
        if (this.currentCall) {
            this.currentCall.disconnect();
        }
        if (this.device) {
            this.device.unregister();
            this.device.destroy();
        }
        this.device = null;
        this.currentCall = null;
        this.listeners = [];
    }
}

export const callManager = new CallManager();
export default callManager;
