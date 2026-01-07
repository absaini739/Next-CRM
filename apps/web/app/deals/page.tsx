'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function DealsPage() {
    const router = useRouter();
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const response = await api.get('/deals');
            setDeals(response.data);
        } catch (error) {
            toast.error('Failed to load deals');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: deals.length,
        open: deals.filter(d => d.status === 'open').length,
        won: deals.filter(d => d.status === 'won').length,
        lost: deals.filter(d => d.status === 'lost').length,
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="text-blue-600">Dashboard</span>
                            <span className="mx-2">/</span>
                            <span>Deals</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your sales pipeline and track deal progress
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/deals/new')}
                        className="flex items-center"
                    >
                        Create Deal
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Deals"
                        value={stats.total}
                        icon={ChartBarIcon}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100"
                    />
                    <SummaryCard
                        title="Open"
                        value={stats.open}
                        icon={CurrencyDollarIcon}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-100"
                    />
                    <SummaryCard
                        title="Won"
                        value={stats.won}
                        icon={CheckCircleIcon}
                        iconColor="text-green-600"
                        iconBg="bg-green-100"
                    />
                    <SummaryCard
                        title="Lost"
                        value={stats.lost}
                        icon={XCircleIcon}
                        iconColor="text-red-600"
                        iconBg="bg-red-100"
                    />
                </div>

                {/* Deals List/Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Close Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {deals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No deals found. Create your first deal to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    deals.map((deal) => (
                                        <tr
                                            key={deal.id}
                                            onClick={() => router.push(`/deals/${deal.id}`)}
                                            className="hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{deal.title}</div>
                                                {deal.description && (
                                                    <div className="text-sm text-gray-500 line-clamp-1">{deal.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ${parseFloat(deal.deal_value || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${deal.status === 'won' ? 'bg-green-100 text-green-800' :
                                                        deal.status === 'lost' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {deal.expected_close_date
                                                    ? new Date(deal.expected_close_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/deals/${deal.id}/edit`);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function SummaryCard({
    title,
    value,
    icon: Icon,
    iconColor,
    iconBg,
}: {
    title: string;
    value: number;
    icon: any;
    iconColor: string;
    iconBg: string;
}) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${iconBg}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}
