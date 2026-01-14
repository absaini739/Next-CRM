'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '@/lib/usePermissions';

export default function RolesPage() {
    const router = useRouter();
    const { canPerformAction } = usePermissions();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            // Use default roles if API fails
            setRoles([
                { id: 1, name: 'Administrator', description: 'Full access to all features', permission_type: 'all' },
                { id: 2, name: 'Sales Manager', description: 'Manage leads, deals, and team', permission_type: 'custom' },
                { id: 3, name: 'Sales Rep', description: 'View and manage assigned records', permission_type: 'custom' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (name === 'Administrator') {
            toast.error('Cannot delete Administrator role');
            return;
        }

        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            await api.delete(`/roles/${id}`);
            toast.success('Role deleted successfully');
            fetchRoles();
        } catch (error) {
            toast.error('Failed to delete role');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading roles...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        {/* Breadcrumbs removed as requested */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Roles & Permissions</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage user roles and their permissions
                        </p>
                    </div>
                    {canPerformAction('settings.user.roles', 'create') && (
                        <Button
                            variant="primary"
                            onClick={() => router.push('/settings/roles/create')}
                            className="flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Role
                        </Button>
                    )}
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <Card key={role.id}>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 dark:text-slate-100">{role.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400 mt-1">{role.description}</p>
                                    </div>
                                    <Badge
                                        variant={role.permission_type === 'all' ? 'success' : 'info'}
                                        size="sm"
                                    >
                                        {role.permission_type === 'all' ? 'Full Access' : 'Custom'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                                    {canPerformAction('settings.user.roles', 'edit') && (
                                        <button
                                            onClick={() => router.push(`/settings/roles/${role.id}/edit`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Edit"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    {role.name !== 'Administrator' && canPerformAction('settings.user.roles', 'delete') && (
                                        <button
                                            onClick={() => handleDelete(role.id, role.name)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
