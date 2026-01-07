'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function OrganizationsPage() {
    const router = useRouter();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await api.get('/organizations');
            setOrganizations(response.data);
        } catch (error) {
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Organization Name',
            sortable: true,
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Organizations</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage your company accounts
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/organizations/new')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Organization
                    </Button>
                </div>

                <Card>
                    <DataTable
                        columns={columns}
                        data={organizations}
                        onRowClick={(org) => router.push(`/organizations/${org.id}`)}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
}
