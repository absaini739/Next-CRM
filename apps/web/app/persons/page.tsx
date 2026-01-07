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

export default function PersonsPage() {
    const router = useRouter();
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPersons();
    }, []);

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            toast.error('Failed to load persons');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
        },
        {
            key: 'emails',
            label: 'Email',
            render: (emails: any[]) => {
                if (!emails || emails.length === 0) return '-';
                const primary = emails.find(e => e.label === 'primary') || emails[0];
                return primary?.value || '-';
            },
        },
        {
            key: 'contact_numbers',
            label: 'Phone',
            render: (numbers: any[]) => {
                if (!numbers || numbers.length === 0) return '-';
                const primary = numbers.find(n => n.label === 'primary') || numbers[0];
                return primary?.value || '-';
            },
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
                    <div className="text-lg text-gray-600">Loading...</div>
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
                        <h1 className="text-2xl font-bold text-gray-900">Persons</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your contacts and leads
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/persons/new')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Person
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <DataTable
                        columns={columns}
                        data={persons}
                        onRowClick={(person) => router.push(`/persons/${person.id}`)}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
}
