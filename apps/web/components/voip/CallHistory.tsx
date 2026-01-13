import { useEffect, useState } from 'react';
import { PhoneIcon, PhoneArrowUpRightIcon, PhoneArrowDownLeftIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import api from '@/lib/api';
import Card from '@/components/ui/Card';

interface CallLog {
    id: number;
    call_sid: string;
    direction: 'inbound' | 'outbound';
    from_number: string;
    to_number: string;
    status: string;
    duration: number;
    recording_url: string | null;
    started_at: string;
}

export default function CallHistory() {
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all');

    useEffect(() => {
        fetchCallHistory();
    }, [filter]);

    const fetchCallHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/voip/history', {
                params: {
                    direction: filter === 'all' ? undefined : filter,
                    limit: 50,
                }
            });
            setCalls(response.data.calls || []);
        } catch (error) {
            console.error('Error fetching call history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'no-answer': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            busy: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5" />
                        Call History
                    </h2>

                    {/* Filter */}
                    <div className="flex gap-2">
                        {(['all', 'inbound', 'outbound'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Call List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-slate-400">Loading calls...</p>
                    </div>
                ) : calls.length === 0 ? (
                    <div className="text-center py-12">
                        <PhoneIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600" />
                        <p className="mt-2 text-gray-500 dark:text-slate-400">No calls yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {calls.map((call) => (
                            <div
                                key={call.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    {/* Direction Icon */}
                                    <div className={`p-2 rounded-full ${call.direction === 'outbound'
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                        {call.direction === 'outbound' ? (
                                            <PhoneArrowUpRightIcon className="h-4 w-4" />
                                        ) : (
                                            <PhoneArrowDownLeftIcon className="h-4 w-4" />
                                        )}
                                    </div>

                                    {/* Call Info */}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {call.direction === 'outbound' ? call.to_number : call.from_number}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">
                                            {format(new Date(call.started_at), 'MMM d, yyyy h:mm a')}
                                        </p>
                                    </div>

                                    {/* Duration */}
                                    {call.duration > 0 && (
                                        <div className="text-sm text-gray-600 dark:text-slate-400">
                                            {formatDuration(call.duration)}
                                        </div>
                                    )}

                                    {/* Status */}
                                    {getStatusBadge(call.status)}

                                    {/* Play Recording */}
                                    {call.recording_url && (
                                        <button
                                            onClick={() => window.open(call.recording_url!, '_blank')}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors"
                                            title="Play recording"
                                        >
                                            <PlayIcon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
