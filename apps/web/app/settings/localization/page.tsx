'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LocalizationPage() {
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('America/New_York');
    const [currency, setCurrency] = useState('USD');
    const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Localization</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Localization</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Language, timezone, and currency settings</p>
                </div>

                <Card className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <Button variant="primary">Save Changes</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
