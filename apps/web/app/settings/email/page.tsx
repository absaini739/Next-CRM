'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function EmailPage() {
    const [accounts] = useState([
        {
            id: 1,
            email: 'sales@company.com',
            provider: 'Gmail',
            status: 'connected',
            last_sync: '2024-01-06 14:30:00',
        },
    ]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Email Integration</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Connect your email accounts for seamless communication
                        </p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Connect Email
                    </Button>
                </div>

                <Card title="Connected Accounts">
                    <div className="space-y-4">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`p-2 rounded-full ${account.status === 'connected' ? 'bg-green-100' : 'bg-red-100'
                                            }`}
                                    >
                                        {account.status === 'connected' ? (
                                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <XCircleIcon className="h-6 w-6 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{account.email}</h4>
                                        <p className="text-sm text-gray-500">
                                            {account.provider} • Last synced: {account.last_sync}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={account.status === 'connected' ? 'success' : 'danger'}>
                                        {account.status}
                                    </Badge>
                                    <Button variant="secondary" size="sm">
                                        Reconnect
                                    </Button>
                                    <Button variant="danger" size="sm">
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Email Settings">
                    <div className="space-y-6">
                        <Select
                            label="Default Email Account"
                            options={[
                                { value: '1', label: 'sales@company.com' },
                            ]}
                            value="1"
                            onChange={() => { }}
                        />

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm text-gray-700">
                                    Auto-sync emails every 5 minutes
                                </span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm text-gray-700">
                                    Track email opens and clicks
                                </span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm text-gray-700">
                                    Send me notifications for new emails
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="primary">Save Settings</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
