'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { EnvelopeIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface EmailAccount {
    id: number;
    provider: 'gmail' | 'outlook';
    email: string;
    display_name?: string;
    is_default: boolean;
    sync_enabled: boolean;
    last_sync_at?: string;
    created_at: string;
}

export default function EmailAccountsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [accounts, setAccounts] = useState<EmailAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchAccounts();

        // Check for OAuth callback success/error
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const email = searchParams.get('email');

        if (success === 'true' && email) {
            toast.success(`Successfully connected ${email}`);
            // Clean URL
            router.replace('/settings/email-accounts');
        } else if (error === 'true') {
            toast.error('Failed to connect email account');
            router.replace('/settings/email-accounts');
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
            await api.post(`/email-accounts/${id}/sync`);
            toast.success('Sync triggered successfully');
            fetchAccounts();
        } catch (error) {
            toast.error('Failed to trigger sync');
        }
    };

    const getProviderLogo = (provider: string) => {
        if (provider === 'gmail') return '📧';
        if (provider === 'outlook') return '📨';
        return '✉️';
    };

    const getProviderName = (provider: string) => {
        if (provider === 'gmail') return 'Gmail';
        if (provider === 'outlook') return 'Outlook';
        return provider;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Email Accounts</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Connect your email accounts to send and receive emails from the CRM
                    </p>
                </div>

                {/* Connect New Account */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Connect New Account</h3>
                    <div className="flex gap-4">
                        <Button
                            variant="primary"
                            onClick={() => connectAccount('gmail')}
                            disabled={connecting}
                            className="flex items-center"
                        >
                            <span className="mr-2">📧</span>
                            Connect Gmail
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => connectAccount('outlook')}
                            disabled={connecting}
                            className="flex items-center"
                        >
                            <span className="mr-2">📨</span>
                            Connect Outlook
                        </Button>
                    </div>
                </Card>

                {/* Connected Accounts */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Connected Accounts</h3>

                    {loading ? (
                        <Card className="p-6">
                            <p className="text-gray-600 dark:text-slate-400">Loading accounts...</p>
                        </Card>
                    ) : accounts.length === 0 ? (
                        <Card className="p-6">
                            <div className="text-center py-8">
                                <EnvelopeIcon className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-slate-400">No email accounts connected yet</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
                                    Connect your first email account to get started
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {accounts.map((account) => (
                                <Card key={account.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className="text-3xl">{getProviderLogo(account.provider)}</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                                                        {account.email}
                                                    </h4>
                                                    {account.is_default && (
                                                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                                    {getProviderName(account.provider)}
                                                </p>
                                                {account.last_sync_at && (
                                                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                                                        Last synced: {new Date(account.last_sync_at).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        {!account.is_default && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setDefaultAccount(account.id)}
                                                className="flex items-center"
                                            >
                                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                Set Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => triggerSync(account.id)}
                                            className="flex items-center"
                                        >
                                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                                            Sync Now
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => disconnectAccount(account.id)}
                                            className="flex items-center ml-auto"
                                        >
                                            <TrashIcon className="h-4 w-4 mr-1" />
                                            Disconnect
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
