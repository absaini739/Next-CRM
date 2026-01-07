'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement user management API
        setLoading(false);
        setUsers([
            { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Administrator', created_at: new Date().toISOString() },
        ]);
    }, []);

    const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage system users and their access
                        </p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add User
                    </Button>
                </div>

                <Card>
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <DataTable columns={columns} data={users} />
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
