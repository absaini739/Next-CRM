'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const STAGES = [
    { id: 'new', name: 'New', color: 'bg-green-500' },
    { id: 'follow_up', name: 'Follow Up', color: 'bg-green-500' },
    { id: 'prospect', name: 'Prospect', color: 'bg-green-500' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-green-500' },
    { id: 'won', name: 'Won', color: 'bg-green-500' },
];

export default function LeadsPage() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
        } catch (error) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    // Group leads by stage
    const groupedLeads = STAGES.reduce((acc, stage) => {
        acc[stage.id] = leads.filter(l => {
            if (stage.id === 'new') return !l.status || l.status === null;
            if (stage.id === 'won') return l.status === 1;
            return false; // For now, other stages are empty
        });
        return acc;
    }, {} as Record<string, any[]>);

    const calculateStageValue = (stageLeads: any[]) => {
        return stageLeads.reduce((sum, lead) => sum + (parseFloat(lead.lead_value) || 0), 0);
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
                        {/* Breadcrumbs removed as requested */}
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/leads/new')}
                        className="flex items-center"
                    >
                        Create Lead
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by Title"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            Filter
                        </button>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Default Pipeline</option>
                        </select>
                        <div className="flex border border-gray-300 rounded-lg">
                            <button className="p-2 bg-blue-50 text-blue-600">
                                <Squares2X2Icon className="h-5 w-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-50">
                                <ListBulletIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-5 gap-4">
                    {STAGES.map((stage) => {
                        const stageLeads = groupedLeads[stage.id] || [];
                        const stageValue = calculateStageValue(stageLeads);

                        return (
                            <div key={stage.id} className="bg-white rounded-lg border border-gray-200">
                                {/* Column Header */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {stage.name} ({stageLeads.length})
                                            </h3>
                                            <p className="text-sm text-gray-600">${stageValue.toFixed(2)}</p>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <PlusIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className={`h-1 ${stage.color} rounded-full`}></div>
                                </div>

                                {/* Column Content */}
                                <div className="p-4 space-y-3 min-h-[400px]">
                                    {stageLeads.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="mb-4">
                                                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                Your Leads List is Empty
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Create a lead to organize your goals.
                                            </p>
                                            <button
                                                onClick={() => router.push('/leads/new')}
                                                className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                                            >
                                                Create Lead
                                            </button>
                                        </div>
                                    ) : (
                                        stageLeads.map((lead) => (
                                            <div
                                                key={lead.id}
                                                onClick={() => router.push(`/leads/${lead.id}`)}
                                                className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
                                            >
                                                <h4 className="font-medium text-gray-900 mb-1">{lead.title}</h4>
                                                {lead.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{lead.description}</p>
                                                )}
                                                {lead.lead_value && (
                                                    <p className="text-sm font-semibold text-blue-600">
                                                        ${parseFloat(lead.lead_value).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
