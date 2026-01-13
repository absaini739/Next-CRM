'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface EmailAccount {
    id: number;
    provider: 'gmail' | 'outlook' | 'other';
    email: string;
    display_name?: string;
    is_default: boolean;
    sync_enabled: boolean;
    last_sync_at?: string;
    created_at: string;
    connection_type?: string;
    smtp_host?: string;
    smtp_port?: number;
    imap_host?: string;
    imap_port?: number;
    app_password?: string;
}

import ConnectEmailModal from './ConnectEmailModal';

export default function EmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [accounts, setAccounts] = useState<EmailAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [showManualConnect, setShowManualConnect] = useState(false);

    useEffect(() => {
        fetchAccounts();

        // Check for OAuth callback success/error
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const email = searchParams.get('email');

        if (success === 'true' && email) {
            toast.success(`Successfully connected ${email}`);
            // Clean URL
            router.replace('/settings/email');
        } else if (error === 'true') {
            toast.error('Failed to connect email account');
            router.replace('/settings/email');
        }
    }, [searchParams]);

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/email-accounts');
            setAccounts(response.data);
        } catch (error) {
            toast.error('Failed to load email accounts');
        } finally {
            setLoading(false);
        }
    };

    const connectAccount = async (provider: 'gmail' | 'outlook') => {
        setConnecting(true);
        try {
            const response = await api.post('/email-accounts/connect', { provider });
            // Redirect to OAuth URL
            window.location.href = response.data.authUrl;
        } catch (error) {
            toast.error(`Failed to initiate ${provider} connection`);
            setConnecting(false);
        }
    };

    const disconnectAccount = async (id: number) => {
        if (!confirm('Are you sure you want to disconnect this email account?')) return;

        try {
            await api.delete(`/email-accounts/${id}`);
            toast.success('Email account disconnected');
            fetchAccounts();
        } catch (error) {
            toast.error('Failed to disconnect account');
        }
    };

    const setDefaultAccount = async (id: number) => {
        try {
            await api.put(`/email-accounts/${id}/default`);
            toast.success('Default account updated');
            fetchAccounts();
        } catch (error) {
            toast.error('Failed to set default account');
        }
    };

    const triggerSync = async (id: number) => {
        try {
            toast.info('Syncing emails...');
            await api.post(`/email-accounts/${id}/sync`);
            toast.success('Sync completed');
            fetchAccounts();
        } catch (error) {
            toast.error('Failed to sync emails');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Email Integration</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                            Connect your email accounts for seamless communication
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            className="flex items-center"
                            onClick={() => connectAccount('gmail')}
                            disabled={connecting}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Connect Gmail
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex items-center"
                            onClick={() => connectAccount('outlook')}
                            disabled={connecting}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Connect Outlook
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex items-center"
                            onClick={() => setShowManualConnect(true)}
                            disabled={connecting}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            App Password
                        </Button>
                    </div>
                </div>

                <Card title="Connected Accounts">
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center py-4 text-gray-500">Loading accounts...</p>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No accounts connected yet.</p>
                            </div>
                        ) : (
                            accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900 dark:text-slate-100">{account.email}</h4>
                                                {account.is_default && (
                                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-slate-500">
                                                {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)} • Last synced: {account.last_sync_at ? new Date(account.last_sync_at).toLocaleString() : 'Never'}
                                            </p>
                                            {account.connection_type === 'smtp_imap' && (
                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-slate-500">
                                                    <span>SMTP: {account.smtp_host}:{account.smtp_port}</span>
                                                    <span>IMAP: {account.imap_host}:{account.imap_port}</span>
                                                    {account.app_password && (
                                                        <span className="flex items-center gap-1">
                                                            App PW:
                                                            <code className="bg-white/50 dark:bg-black/20 px-1 rounded text-blue-500 select-all">
                                                                {account.app_password}
                                                            </code>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="success">
                                            connected
                                        </Badge>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => triggerSync(account.id)}
                                        >
                                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                                            Sync
                                        </Button>
                                        {!account.is_default && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setDefaultAccount(account.id)}
                                            >
                                                Make Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => disconnectAccount(account.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card title="Email Settings">
                    <div className="space-y-6">
                        <Select
                            label="Default Email Account"
                            options={accounts.map(acc => ({ value: acc.id.toString(), label: acc.email }))}
                            value={accounts.find(acc => acc.is_default)?.id?.toString() || ''}
                            onChange={(e) => setDefaultAccount(parseInt(e.target.value))}
                        />

                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                    Auto-sync emails every 5 minutes
                                </span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                    Track email opens and clicks
                                </span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                    Send me notifications for new emails
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="primary" onClick={() => toast.success('Settings saved')}>Save Settings</Button>
                        </div>
                    </div>
                </Card>

                <ConnectEmailModal
                    isOpen={showManualConnect}
                    onClose={() => setShowManualConnect(false)}
                    onSuccess={fetchAccounts}
                />
            </div>
        </DashboardLayout>
    );
}
