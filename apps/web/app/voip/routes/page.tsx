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

export default function InboundRoutesPage() {
    const router = useRouter();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await api.get('/voip/routes');
            setRoutes(response.data);
        } catch (error) {
            toast.error('Failed to load inbound routes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this route?')) return;

        try {
            await api.delete(`/voip/routes/${id}`);
            toast.success('Route deleted successfully');
            fetchRoutes();
        } catch (error) {
            toast.error('Failed to delete route');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inbound Routes</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Define how incoming calls are routed based on DID patterns
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/voip/routes/create')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Route
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DID Pattern</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trunk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {routes.map((route) => (
                                    <tr key={route.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{route.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {route.did_pattern}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {route.destination_type}: {route.destination_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {route.trunk?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {route.priority}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={route.active ? 'success' : 'default'}>
                                                {route.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => router.push(`/voip/routes/${route.id}/edit`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(route.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {routes.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No inbound routes found. Create your first route to get started.
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
