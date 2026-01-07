'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlayIcon, ArrowDownTrayIcon, PhoneArrowDownLeftIcon, PhoneArrowUpRightIcon } from '@heroicons/react/24/outline';

export default function CallRecordingsPage() {
    const [recordings, setRecordings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecordings();
    }, []);

    const fetchRecordings = async () => {
        try {
            const response = await api.get('/voip/recordings');
            setRecordings(response.data);
        } catch (error) {
            toast.error('Failed to load call recordings');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Call Recordings</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        View and manage recorded calls
                    </p>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Recording SID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">From</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Direction</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recordings.map((recording) => (
                                    <tr key={recording.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {recording.recording_sid}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {recording.from_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {recording.to_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {recording.direction === 'inbound' ? (
                                                    <PhoneArrowDownLeftIcon className="h-5 w-5 text-green-600 mr-2" />
                                                ) : (
                                                    <PhoneArrowUpRightIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                )}
                                                <Badge variant={recording.direction === 'inbound' ? 'success' : 'info'}>
                                                    {recording.direction}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {recording.user?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {formatDuration(recording.duration)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {new Date(recording.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {recording.recording_url && (
                                                    <>
                                                        <button
                                                            onClick={() => window.open(recording.recording_url, '_blank')}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Play"
                                                        >
                                                            <PlayIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(recording.recording_url, '_blank')}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Download"
                                                        >
                                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recordings.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-500">
                                            No call recordings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
