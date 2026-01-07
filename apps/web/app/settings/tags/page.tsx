'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TagIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function TagsPage() {
    const tags = [
        { name: 'Hot Lead', color: 'red', count: 45 },
        { name: 'VIP Customer', color: 'purple', count: 23 },
        { name: 'Follow-up Required', color: 'yellow', count: 67 },
        { name: 'Enterprise', color: 'blue', count: 12 },
        { name: 'Small Business', color: 'green', count: 89 },
    ];

    const colorMap: Record<string, string> = {
        red: 'bg-red-100 text-red-800',
        purple: 'bg-purple-100 text-purple-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                            <span className="text-blue-600">Settings</span>
                            <span className="mx-2">/</span>
                            <span>Tags & Categories</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tags & Categories</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage tags and categorization
                        </p>
                    </div>
                    <Button variant="primary" className="flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Tag
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Tag Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Color</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Usage Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tags.map((tag, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <TagIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-slate-400" />
                                                <span className="font-medium">{tag.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${colorMap[tag.color]}`}>
                                                {tag.color}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">{tag.count} items</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm">Edit</Button>
                                                <Button variant="secondary" size="sm">Delete</Button>
                                            </div>
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
