'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WrenchScrewdriverIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function CustomFieldsPage() {
    const customFields = [
        { id: 1, name: 'Industry', entity: 'Lead', type: 'Dropdown', required: true },
        { id: 2, name: 'Company Size', entity: 'Organization', type: 'Number', required: false },
        { id: 3, name: 'Budget', entity: 'Deal', type: 'Currency', required: true },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="text-blue-600">Settings</span>
                            <span className="mx-2">/</span>
                            <span>Custom Fields</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Add custom fields to your CRM entities
                        </p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Custom Field
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customFields.map(field => (
                                    <tr key={field.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{field.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{field.entity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{field.type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {field.required ? 'Required' : 'Optional'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Button variant="secondary" size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
