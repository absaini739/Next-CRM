'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CubeIcon } from '@heroicons/react/24/outline';

export default function IntegrationsPage() {
    const integrations = [
        { name: 'Slack', description: 'Get CRM notifications in Slack', connected: true, logo: '💬' },
        { name: 'Google Calendar', description: 'Sync tasks and meetings', connected: true, logo: '📅' },
        { name: 'Zapier', description: 'Connect 5000+ apps', connected: false, logo: '⚡' },
        { name: 'Mailchimp', description: 'Email marketing integration', connected: false, logo: '📧' },
        { name: 'Stripe', description: 'Payment processing', connected: false, logo: '💳' },
        { name: 'QuickBooks', description: 'Accounting integration', connected: false, logo: '💰' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>API & Integrations</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">API & Integrations</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Connect third-party apps and services
                    </p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Production API Key</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500 font-mono">pk_live_••••••••••••••••</p>
                            </div>
                            <Button variant="secondary">Regenerate</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Test API Key</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500 font-mono">pk_test_••••••••••••••••</p>
                            </div>
                            <Button variant="secondary">Regenerate</Button>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrations.map((integration, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="text-3xl">{integration.logo}</div>
                                    <div>
                                        <h3 className="font-semibold">{integration.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">{integration.description}</p>
                                    </div>
                                </div>
                                <Button
                                    variant={integration.connected ? "secondary" : "primary"}
                                    size="sm"
                                >
                                    {integration.connected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
