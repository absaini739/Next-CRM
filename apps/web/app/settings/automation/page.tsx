'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BoltIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function AutomationPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="text-blue-600">Settings</span>
                            <span className="mx-2">/</span>
                            <span>Workflow Automation</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Create automated workflows and triggers
                        </p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Workflow
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Lead Assignment</h3>
                        <p className="text-sm text-gray-600 mb-4">Automatically assign new leads to sales reps based on territory, industry, or round-robin</p>
                        <Button variant="secondary">Configure</Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Email Sequences</h3>
                        <p className="text-sm text-gray-600 mb-4">Send automated email sequences when leads enter specific pipeline stages</p>
                        <Button variant="secondary">Configure</Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Task Creation</h3>
                        <p className="text-sm text-gray-600 mb-4">Automatically create tasks when deals move to certain stages</p>
                        <Button variant="secondary">Configure</Button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                        <p className="text-sm text-gray-600 mb-4">Send notifications to team members on specific events</p>
                        <Button variant="secondary">Configure</Button>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
