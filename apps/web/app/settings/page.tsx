'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { Cog6ToothIcon, UserGroupIcon, ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your CRM configuration and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SettingCard
                        icon={<UserGroupIcon className="h-8 w-8 text-blue-600" />}
                        title="User Management"
                        description="Manage users, roles, and permissions"
                        href="/settings/users"
                    />
                    <SettingCard
                        icon={<ShieldCheckIcon className="h-8 w-8 text-green-600" />}
                        title="Roles & Permissions"
                        description="Configure access control and security"
                        href="/settings/roles"
                    />
                    <SettingCard
                        icon={<Cog6ToothIcon className="h-8 w-8 text-purple-600" />}
                        title="Pipeline Configuration"
                        description="Customize lead and deal pipelines"
                        href="/settings/pipelines"
                    />
                    <SettingCard
                        icon={<EnvelopeIcon className="h-8 w-8 text-orange-600" />}
                        title="Email Integration"
                        description="Connect your email accounts"
                        href="/settings/email"
                    />
                </div>

                <Card>
                    <div className="text-center py-12">
                        <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Settings Configuration</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Advanced settings pages will be implemented in the next phase.
                            <br />
                            Core CRM functionality is fully operational!
                        </p>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}

function SettingCard({
    icon,
    title,
    description,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{icon}</div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </a>
    );
}
