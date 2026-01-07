'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [dealUpdates, setDealUpdates] = useState(true);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Notifications</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Notification Settings</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Configure email and push notifications
                    </p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500">Receive email notifications for important events</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Push Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500">Receive browser push notifications</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={pushNotifications}
                                onChange={(e) => setPushNotifications(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Task Reminders</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500">Get reminded about upcoming tasks</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={taskReminders}
                                onChange={(e) => setTaskReminders(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Deal Updates</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500">Notify when deals are updated</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={dealUpdates}
                                onChange={(e) => setDealUpdates(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
