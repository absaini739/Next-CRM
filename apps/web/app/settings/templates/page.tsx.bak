'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function TemplatesPage() {
    const templates = [
        { id: 1, name: 'Welcome Email', subject: 'Welcome to our CRM!', category: 'Onboarding' },
        { id: 2, name: 'Follow-up', subject: 'Following up on our conversation', category: 'Sales' },
        { id: 3, name: 'Quote Sent', subject: 'Your quote is ready', category: 'Sales' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="text-blue-600">Settings</span>
                            <span className="mx-2">/</span>
                            <span>Email Templates</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                        <p className="mt-1 text-sm text-gray-600">Create and manage email templates</p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New Template
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <p className="text-sm text-gray-600">{template.subject}</p>
                                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{template.category}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="secondary" size="sm">Edit</Button>
                                    <Button variant="secondary" size="sm">Preview</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
