import { useEffect, useState } from 'react';
import { EyeIcon, CursorArrowRaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface TrackingEvent {
    type: 'open' | 'click';
    timestamp: string;
    url?: string;
    ip?: string;
}

interface TrackingStats {
    total_opens: number;
    unique_opens: number;
    first_open: string | null;
    last_open: string | null;
    total_clicks: number;
    unique_clicks: number;
    clicked_urls: Record<string, number>;
    events: TrackingEvent[];
}

interface EmailTrackingStatsProps {
    messageId: number;
}

export default function EmailTrackingStats({ messageId }: EmailTrackingStatsProps) {
    const [stats, setStats] = useState<TrackingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, [messageId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/track/stats/${messageId}`);
            setStats(data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching tracking stats:', err);
            setError(err.response?.data?.message || 'Failed to load tracking stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                <p>{error}</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                <p>No tracking data available</p>
            </div>
        );
    }

    const hasActivity = stats.total_opens > 0 || stats.total_clicks > 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Opens */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {stats.total_opens}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                Total Opens
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unique Opens */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <EyeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {stats.unique_opens}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                                Unique Opens
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clicks */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                            <CursorArrowRaysIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {stats.total_clicks}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">
                                Total Clicks
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unique Clicks */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                            <CursorArrowRaysIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                {stats.unique_clicks}
                            </div>
                            <div className="text-sm text-orange-700 dark:text-orange-300">
                                Unique Clicks
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* First/Last Open */}
            {stats.first_open && (
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                    First Opened
                                </div>
                                <div className="text-sm text-gray-600 dark:text-slate-400">
                                    {formatDistanceToNow(new Date(stats.first_open), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                        {stats.last_open && (
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                                <div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                        Last Opened
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-slate-400">
                                        {formatDistanceToNow(new Date(stats.last_open), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Clicked URLs */}
            {Object.keys(stats.clicked_urls).length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Clicked Links
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(stats.clicked_urls).map(([url, count]) => (
                            <div key={url} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate flex-1"
                                >
                                    {url}
                                </a>
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                                    {count} {count === 1 ? 'click' : 'clicks'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity Timeline */}
            {hasActivity && stats.events.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Activity Timeline
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {stats.events.map((event, index) => (
                            <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded">
                                <div className={`p-1.5 rounded-full ${event.type === 'open'
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-purple-100 dark:bg-purple-900/30'
                                    }`}>
                                    {event.type === 'open' ? (
                                        <EyeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    ) : (
                                        <CursorArrowRaysIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {event.type}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400">
                                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {event.url && (
                                        <div className="text-xs text-gray-600 dark:text-slate-400 truncate mt-0.5">
                                            {event.url}
                                        </div>
                                    )}
                                    {event.ip && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                                            <MapPinIcon className="h-3 w-3" />
                                            {event.ip}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!hasActivity && (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <EyeIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tracking activity yet</p>
                    <p className="text-sm mt-1">Opens and clicks will appear here</p>
                </div>
            )}
        </div>
    );
}
