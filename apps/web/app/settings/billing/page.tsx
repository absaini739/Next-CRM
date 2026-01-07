'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function BillingPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Billing</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Billing & Subscription</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Manage your subscription and invoices</p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                            <p className="font-semibold text-lg">Professional Plan</p>
                            <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">$99/month • Unlimited users</p>
                        </div>
                        <Button variant="primary">Upgrade</Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl">💳</div>
                            <div>
                                <p className="font-medium">Visa ending in 4242</p>
                                <p className="text-sm text-gray-500 dark:text-slate-500">Expires 12/2025</p>
                            </div>
                        </div>
                        <Button variant="secondary">Update</Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium">Invoice #{1000 + i}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-500">Dec {i}, 2025 • $99.00</p>
                                </div>
                                <Button variant="secondary" size="sm">Download</Button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
