'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function AdvancedPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Advanced Settings</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Advanced Settings</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Database, backups, and system configuration
                    </p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Database Management</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Database Backup</p>
                                <p className="text-sm text-gray-500">Last backup: 2 hours ago</p>
                            </div>
                            <Button variant="primary">Backup Now</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Database Optimization</p>
                                <p className="text-sm text-gray-500">Optimize database tables for better performance</p>
                            </div>
                            <Button variant="secondary">Optimize</Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                defaultValue={30}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Upload Size (MB)</label>
                            <input
                                type="number"
                                defaultValue={10}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Maintenance Mode</p>
                                <p className="text-sm text-gray-500">Temporarily disable access for maintenance</p>
                            </div>
                            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                        </div>

                        <div className="pt-4">
                            <Button variant="primary">Save Changes</Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-red-50 border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
                            <div>
                                <p className="font-medium text-red-900">Clear All Cache</p>
                                <p className="text-sm text-red-700">Remove all cached data</p>
                            </div>
                            <Button variant="secondary">Clear Cache</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
                            <div>
                                <p className="font-medium text-red-900">Reset to Factory Settings</p>
                                <p className="text-sm text-red-700">This action cannot be undone</p>
                            </div>
                            <Button variant="secondary">Reset</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
