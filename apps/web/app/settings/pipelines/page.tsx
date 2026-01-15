'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function PipelinesPage() {
    const [leadStages, setLeadStages] = useState([
        { id: 1, name: 'New', order: 1 },
        { id: 2, name: 'Contacted', order: 2 },
        { id: 3, name: 'Qualified', order: 3 },
        { id: 4, name: 'Proposal Sent', order: 4 },
    ]);

    const [dealStages, setDealStages] = useState([
        { id: 1, name: 'Negotiation', order: 1 },
        { id: 2, name: 'Contract Sent', order: 2 },
        { id: 3, name: 'Won', order: 3 },
        { id: 4, name: 'Lost', order: 4 },
    ]);

    const handleLeadStageChange = (id: number, name: string) => {
        setLeadStages(prev => prev.map(stage => (stage.id === id ? { ...stage, name } : stage)));
    };

    const handleDealStageChange = (id: number, name: string) => {
        setDealStages(prev => prev.map(stage => (stage.id === id ? { ...stage, name } : stage)));
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Pipeline Configuration</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Customize your lead and deal pipeline stages
                    </p>
                </div>

                <Card title="Lead Pipeline Stages">
                    <div className="space-y-4">
                        {leadStages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500 dark:text-slate-500 w-8">{index + 1}.</span>
                                <Input
                                    value={stage.name}
                                    className="flex-1"
                                    onChange={(e) => handleLeadStageChange(stage.id, e.target.value)}
                                />
                                <Button variant="danger" size="sm">
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="secondary" size="sm" className="mt-2">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Stage
                        </Button>
                    </div>
                </Card>

                <Card title="Deal Pipeline Stages">
                    <div className="space-y-4">
                        {dealStages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500 dark:text-slate-500 w-8">{index + 1}.</span>
                                <Input
                                    value={stage.name}
                                    className="flex-1"
                                    onChange={(e) => handleDealStageChange(stage.id, e.target.value)}
                                />
                                <Button variant="danger" size="sm">
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="secondary" size="sm" className="mt-2">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Stage
                        </Button>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button variant="primary">Save Changes</Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
