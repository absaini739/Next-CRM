import { useEffect, useState } from 'react';
import {
    PhoneIcon,
    PhoneXMarkIcon,
    MicrophoneIcon,
    SpeakerWaveIcon
} from '@heroicons/react/24/solid';
import callManager, { CallState } from '@/lib/voip/callManager';

export default function CallModal() {
    const [callState, setCallState] = useState<CallState>(callManager.getState());

    useEffect(() => {
        const unsubscribe = callManager.subscribe(setCallState);
        return unsubscribe;
    }, []);

    if (callState.status === 'idle') {
        return null;
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusText = () => {
        switch (callState.status) {
            case 'connecting':
                return 'Connecting...';
            case 'ringing':
                return 'Ringing...';
            case 'active':
                return formatDuration(callState.duration);
            case 'ended':
                return 'Call Ended';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (callState.status) {
            case 'connecting':
            case 'ringing':
                return 'bg-yellow-500';
            case 'active':
                return 'bg-green-500';
            case 'ended':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 p-6 w-80">
                {/* Status Indicator */}
                <div className="flex items-center justify-center mb-4">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor()} animate-pulse mr-2`}></div>
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                        {getStatusText()}
                    </span>
                </div>

                {/* Phone Number */}
                <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {callState.phoneNumber}
                    </p>
                </div>

                {/* Call Controls */}
                <div className="flex items-center justify-center gap-4">
                    {/* Mute */}
                    {callState.status === 'active' && (
                        <button
                            onClick={() => callManager.toggleMute()}
                            className={`p-4 rounded-full transition-colors ${callState.isMuted
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                            title={callState.isMuted ? 'Unmute' : 'Mute'}
                        >
                            <MicrophoneIcon className={`h-6 w-6 ${callState.isMuted ? 'line-through' : ''}`} />
                        </button>
                    )}

                    {/* End Call */}
                    {(callState.status === 'active' || callState.status === 'ringing' || callState.status === 'connecting') && (
                        <button
                            onClick={() => callManager.endCall()}
                            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                            title="End Call"
                        >
                            <PhoneXMarkIcon className="h-6 w-6" />
                        </button>
                    )}

                    {/* Answer (for incoming) */}
                    {callState.status === 'ringing' && (
                        <button
                            onClick={() => callManager.answerCall()}
                            className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors animate-bounce"
                            title="Answer Call"
                        >
                            <PhoneIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Active Call Info */}
                {callState.status === 'active' && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            {callState.isMuted && '🔇 Muted'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
