'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function VoIPProvidersPage() {
    const router = useRouter();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const response = await api.get('/voip/providers');
            setProviders(response.data);
        } catch (error) {
            toast.error('Failed to load VoIP providers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this provider?')) return;

        try {
            await api.delete(`/voip/providers/${id}`);
            toast.success('Provider deleted successfully');
            fetchProviders();
        } catch (error) {
            toast.error('Failed to delete provider');
        }
    };

    const getProviderTypeBadge = (type: string) => {
        const variants: any = {
            twilio: 'info',
            telnyx: 'success',
            sip: 'warning',
        };
        return variants[type] || 'default';
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">VoIP Providers</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage your VoIP service providers (Twilio, Telnyx, Generic SIP)
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/voip/providers/create')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Provider
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">From Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Trunks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {providers.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-slate-100">{provider.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getProviderTypeBadge(provider.provider_type)}>
                                                {provider.provider_type.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {provider.from_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {provider.trunks?.length || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={provider.active ? 'success' : 'default'}>
                                                {provider.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => router.push(`/voip/providers/${provider.id}/edit`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(provider.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {providers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-500">
                                            No VoIP providers found. Create your first provider to get started.
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
