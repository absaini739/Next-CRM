'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ReportsPage() {
    const reports = [
        { name: 'Sales Pipeline', description: 'Track deals through your pipeline', type: 'Sales' },
        { name: 'Lead Conversion', description: 'Monitor lead to customer conversion rates', type: 'Marketing' },
        { name: 'Revenue Forecast', description: 'Predict future revenue based on pipeline', type: 'Finance' },
        { name: 'Team Performance', description: 'Analyze individual and team metrics', type: 'Management' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                            <span className="text-blue-600">Settings</span>
                            <span className="mx-2">/</span>
                            <span>Reports & Analytics</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Reports & Analytics</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Configure dashboards and custom reports
                        </p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Report
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{report.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400 mb-2">{report.description}</p>
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {report.type}
                                    </span>
                                </div>
                                <Button variant="secondary" size="sm">View</Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Dashboard Widgets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Revenue Chart', 'Pipeline Overview', 'Recent Activities', 'Top Performers'].map((widget) => (
                            <div key={widget} className="p-4 border rounded-lg text-center">
                                <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-slate-400" />
                                <p className="text-sm font-medium">{widget}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
