'use client';

import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';

export default function DebugPermissionsPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Permission Debug</h1>
                    <p>No user logged in</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Permission Debug</h1>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        View your current user permissions
                    </p>
                </div>

                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">User Information</h2>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role ID:</strong> {user.role_id}</p>
                            <p><strong>Role Name:</strong> {user.role?.name || 'N/A'}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Permissions Object</h2>
                        <pre className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(user.role?.permissions, null, 2)}
                        </pre>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Full User Object</h2>
                        <pre className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
