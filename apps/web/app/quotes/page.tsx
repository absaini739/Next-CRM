'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function QuotesPage() {
    const router = useRouter();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const response = await api.get('/quotes');
            setQuotes(response.data);
        } catch (error) {
            toast.error('Failed to load quotes');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'subject',
            label: 'Subject',
            sortable: true,
        },
        {
            key: 'grand_total',
            label: 'Total',
            sortable: true,
            render: (total: string) => `$${parseFloat(total || 0).toLocaleString()}`,
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your sales quotes and proposals
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/quotes/new')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Quote
                    </Button>
                </div>

                <Card>
                    <DataTable
                        columns={columns}
                        data={quotes}
                        onRowClick={(quote) => router.push(`/quotes/${quote.id}`)}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
}
