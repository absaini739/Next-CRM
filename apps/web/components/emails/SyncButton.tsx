import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface SyncButtonProps {
    accountId: number;
    onSyncComplete?: () => void;
}

export default function SyncButton({ accountId, onSyncComplete }: SyncButtonProps) {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post(`/email-accounts/${accountId}/sync-now`);
            toast.success('Emails synced successfully!');
            if (onSyncComplete) {
                onSyncComplete();
            }
        } catch (error: any) {
            console.error('Sync error:', error);
            toast.error(error.response?.data?.message || 'Failed to sync emails');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Sync emails now"
        >
            <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
    );
}
