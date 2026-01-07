'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function SecurityPage() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [ipRestriction, setIpRestriction] = useState(false);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Security</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Two-factor auth, IP restrictions, and audit logs
                    </p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                            <Button
                                variant={twoFactorEnabled ? "secondary" : "primary"}
                                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            >
                                {twoFactorEnabled ? 'Disable' : 'Enable'}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">IP Restriction</p>
                                <p className="text-sm text-gray-500">Limit access to specific IP addresses</p>
                            </div>
                            <Button
                                variant={ipRestriction ? "secondary" : "primary"}
                                onClick={() => setIpRestriction(!ipRestriction)}
                            >
                                {ipRestriction ? 'Disable' : 'Enable'}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Password Policy</h3>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" readOnly />
                            <label className="ml-2 text-sm">Minimum 8 characters</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" readOnly />
                            <label className="ml-2 text-sm">Require uppercase and lowercase letters</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" readOnly />
                            <label className="ml-2 text-sm">Require at least one number</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                            <label className="ml-2 text-sm">Require special characters</label>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Audit Logs</h3>
                    <p className="text-sm text-gray-600 mb-4">View recent security events and user activities</p>
                    <Button variant="secondary">View Audit Logs</Button>
                </Card>
            </div>
        </DashboardLayout>
    );
}
