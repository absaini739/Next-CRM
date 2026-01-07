'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function BusinessHoursPage() {
    const [businessHours, setBusinessHours] = useState({
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' },
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Business Hours</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Business Hours</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Set working hours and holidays
                    </p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
                    <div className="space-y-4">
                        {Object.entries(businessHours).map(([day, hours]) => (
                            <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={hours.enabled}
                                        className="h-4 w-4 text-blue-600 rounded"
                                        readOnly
                                    />
                                    <span className="font-medium capitalize w-24">{day}</span>
                                </div>
                                {hours.enabled && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="time"
                                            value={hours.start}
                                            className="px-3 py-1 border rounded"
                                            readOnly
                                        />
                                        <span>to</span>
                                        <input
                                            type="time"
                                            value={hours.end}
                                            className="px-3 py-1 border rounded"
                                            readOnly
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Holidays</h3>
                    <div className="space-y-2">
                        {['New Year\'s Day - Jan 1', 'Independence Day - Jul 4', 'Thanksgiving - Nov 28', 'Christmas - Dec 25'].map((holiday) => (
                            <div key={holiday} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span className="text-sm">{holiday}</span>
                                <Button variant="secondary" size="sm">Remove</Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Button variant="secondary">Add Holiday</Button>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
