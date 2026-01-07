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

export default function VoIPTrunksPage() {
    const router = useRouter();
    const [trunks, setTrunks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrunks();
    }, []);

    const fetchTrunks = async () => {
        try {
            const response = await api.get('/voip/trunks');
            setTrunks(response.data);
        } catch (error) {
            toast.error('Failed to load VoIP trunks');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this trunk?')) return;

        try {
            await api.delete(`/voip/trunks/${id}`);
            toast.success('Trunk deleted successfully');
            fetchTrunks();
        } catch (error) {
            toast.error('Failed to delete trunk');
        }
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">VoIP Trunks</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Configure SIP trunks and connection details
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/voip/trunks/create')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Trunk
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Provider</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">SIP Domain</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Port</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Protocol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trunks.map((trunk) => (
                                    <tr key={trunk.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-slate-100">{trunk.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {trunk.provider?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {trunk.sip_domain}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                                            {trunk.sip_port}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info">{trunk.transport_protocol}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={trunk.active ? 'success' : 'default'}>
                                                {trunk.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => router.push(`/voip/trunks/${trunk.id}/edit`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trunk.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {trunks.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-slate-500">
                                            No VoIP trunks found. Create your first trunk to get started.
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
