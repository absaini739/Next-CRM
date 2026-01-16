'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
    BellIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    ClockIcon,
    ArrowsRightLeftIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function NotificationsPage() {
    const { user, updateUserData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        email_notifications: true,
        push_notifications: true,
        task_reminders: true,
        deal_updates: true
    });

    useEffect(() => {
        if (user) {
            setSettings({
                email_notifications: user.email_notifications ?? true,
                push_notifications: user.push_notifications ?? true,
                task_reminders: user.task_reminders ?? true,
                deal_updates: user.deal_updates ?? true
            });
            setLoading(false);
        }
    }, [user]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await api.put('/auth/me', settings);
            updateUserData(response.data);
            toast.success('Notification preferences updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading settings...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <span className="text-blue-600">Settings</span>
                            <span className="mx-2">/</span>
                            <span>Notifications</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Notification Center</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            Control how and when you want to be notified
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-800">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center">
                                    <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-500" />
                                    Communication Prefences
                                </h2>
                            </div>

                            <div className="p-0 divide-y divide-gray-100 dark:divide-slate-700">
                                {/* Email Notifications */}
                                <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                            <EnvelopeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-base">Email Notifications</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Main hub for all system alerts and updates</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('email_notifications')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.email_notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`${settings.email_notifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>

                                {/* Push Notifications */}
                                <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                            <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-base">Browser Push</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Real-time alerts directly on your desktop</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('push_notifications')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.push_notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`${settings.push_notifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>
                            </div>
                        </Card>

                        <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-800">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center">
                                    <BellIcon className="h-5 w-5 mr-2 text-orange-500" />
                                    Activity Alerts
                                </h2>
                            </div>

                            <div className="p-0 divide-y divide-gray-100 dark:divide-slate-700">
                                {/* Task Reminders */}
                                <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                            <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-base">Task Reminders</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Never miss a deadline or scheduled call</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('task_reminders')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.task_reminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`${settings.task_reminders ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>

                                {/* Deal Updates */}
                                <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                            <ArrowsRightLeftIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-base">Deal Intelligence</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Updates on deal movements and status changes</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('deal_updates')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.deal_updates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`${settings.deal_updates ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6 bg-blue-600 text-white border-none shadow-lg shadow-blue-200 dark:shadow-none">
                            <ShieldCheckIcon className="h-8 w-8 mb-4 opacity-80" />
                            <h3 className="text-xl font-black mb-2 tracking-tight">Stay Connected</h3>
                            <p className="text-sm text-blue-100 leading-relaxed mb-6">
                                Keeping your notifications active ensures you stay updated on pipeline movements and team collaborations.
                            </p>
                            <Button
                                variant="secondary"
                                className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none font-bold py-3"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'SAVING...' : 'APPLY SETTINGS'}
                            </Button>
                        </Card>

                        <Card className="p-6 border-none shadow-sm bg-gray-50 dark:bg-slate-800/50 text-center">
                            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Account Email</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{user?.email}</p>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
