'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { usePermissions } from '@/lib/usePermissions';
import {
    UsersIcon,
    ShieldCheckIcon,
    FunnelIcon,
    EnvelopeIcon,
    ArrowsRightLeftIcon,
    BellIcon,
    WrenchScrewdriverIcon,
    LockClosedIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    ClockIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface SettingSection {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    route?: string;
    permission?: string; // Permission required to view this setting
}

const settingSections: SettingSection[] = [
    {
        id: 'my-permissions',
        title: 'My Permissions',
        description: 'View your assigned role and access permissions',
        icon: ShieldCheckIcon,
        color: 'bg-indigo-100 text-indigo-600',
        route: '/settings/my-permissions',
        permission: undefined // Always visible to all users
    },
    {
        id: 'users',
        title: 'User Management',
        description: 'Manage users, roles, and permissions',
        icon: UsersIcon,
        color: 'bg-blue-100 text-blue-600',
        route: '/settings/users',
        permission: 'settings.user.users'
    },
    {
        id: 'roles',
        title: 'Roles & Permissions',
        description: 'Configure access control and security',
        icon: ShieldCheckIcon,
        color: 'bg-green-100 text-green-600',
        route: '/settings/roles',
        permission: 'settings.user.roles'
    },
    {
        id: 'pipelines',
        title: 'Pipeline Configuration',
        description: 'Customize lead and deal pipelines',
        icon: FunnelIcon,
        color: 'bg-purple-100 text-purple-600',
        route: '/pipelines',
        permission: 'settings.lead.pipelines'
    },
    {
        id: 'email',
        title: 'Email Integration',
        description: 'Connect your email accounts',
        icon: EnvelopeIcon,
        color: 'bg-orange-100 text-orange-600',
        route: '/settings/email',
        permission: 'settings.automation.emailAccounts'
    },
    {
        id: 'data-transfer',
        title: 'Data Transfer',
        description: 'Import and export your CRM data',
        icon: ArrowsRightLeftIcon,
        color: 'bg-indigo-100 text-indigo-600',
        route: '/data-transfer',
        permission: 'settings.otherSettings.dataTransfer'
    },

    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Configure email and push notifications',
        icon: BellIcon,
        color: 'bg-red-100 text-red-600',
        route: '/settings/notifications',
        permission: 'settings'
    },
    {
        id: 'custom-fields',
        title: 'Custom Fields',
        description: 'Add custom fields to your CRM entities',
        icon: WrenchScrewdriverIcon,
        color: 'bg-pink-100 text-pink-600',
        route: '/settings/custom-fields',
        permission: 'settings'
    },

    {
        id: 'security',
        title: 'Security Settings',
        description: 'Two-factor auth, IP restrictions, audit logs',
        icon: LockClosedIcon,
        color: 'bg-gray-100 text-gray-600',
        route: '/settings/security',
        permission: 'settings'
    },
    {
        id: 'company',
        title: 'Company Profile',
        description: 'Update company information and branding',
        icon: BuildingOfficeIcon,
        color: 'bg-cyan-100 text-cyan-600',
        route: '/settings/company',
        permission: 'settings'
    },



    {
        id: 'templates',
        title: 'Email Templates',
        description: 'Create and manage email templates',
        icon: DocumentTextIcon,
        color: 'bg-amber-100 text-amber-600',
        route: '/settings/templates',
        permission: 'settings.automation.emailTemplates'
    },
    {
        id: 'business-hours',
        title: 'Business Hours',
        description: 'Set working hours and holidays',
        icon: ClockIcon,
        color: 'bg-rose-100 text-rose-600',
        route: '/settings/business-hours',
        permission: 'settings'
    },


];

export default function SettingsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { hasPermission, isAdmin, user } = usePermissions();

    // Filter sections by permissions first, then by search query
    const permissionFilteredSections = settingSections.filter(section => {
        return hasPermission(section.permission);
    });

    const filteredSections = permissionFilteredSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    {/* Breadcrumbs removed as requested */}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Manage your CRM configuration and preferences
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-md">
                    <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSections.map((section) => {
                        const Icon = section.icon;
                        const CardContent = (
                            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow h-full">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg ${section.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 dark:text-slate-100 mb-1">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );

                        return section.route ? (
                            <Link key={section.id} href={section.route}>
                                {CardContent}
                            </Link>
                        ) : (
                            <div key={section.id}>
                                {CardContent}
                            </div>
                        );
                    })}
                </div>

                {filteredSections.length === 0 && (
                    <div className="text-center py-12">
                        {permissionFilteredSections.length === 0 ? (
                            <div>
                                <p className="text-gray-500 dark:text-slate-500 mb-2">You don't have access to any settings.</p>
                                <p className="text-sm text-gray-400 dark:text-slate-600">Contact your administrator to request access.</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-slate-500">No settings found matching your search.</p>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
