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
    PlusCircleIcon
} from '@heroicons/react/24/outline';

interface SettingSection {
    id?: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    href: string;
    permission?: string; // Permission required to view this setting
}

const settingSections: SettingSection[] = [
    {
        title: 'My Permissions',
        description: 'View your assigned role and access permissions',
        icon: ShieldCheckIcon,
        href: '/settings/my-permissions',
        color: 'bg-purple-500',
        // Always visible - no permission required
    },
    {
        title: 'User Management',
        description: 'Manage users, roles, and permissions',
        icon: UsersIcon,
        href: '/settings/users',
        color: 'bg-blue-500',
        permission: 'settings.users'
    },
    {
        title: 'Roles & Permissions',
        description: 'Configure access control and security',
        icon: ShieldCheckIcon,
        href: '/settings/roles',
        color: 'bg-green-500',
        permission: 'settings.roles'
    },
    {
        title: 'Pipeline Configuration',
        description: 'Customize lead and deal pipelines',
        icon: FunnelIcon,
        href: '/pipelines',
        color: 'bg-purple-500',
        permission: 'settings.pipelines'
    },
    {
        title: 'Email Integration',
        description: 'Connect your email accounts',
        icon: EnvelopeIcon,
        href: '/settings/email',
        color: 'bg-orange-500',
        permission: 'settings.emailIntegration'
    },
    {
        title: 'Data Transfer',
        description: 'Import and export your CRM data',
        icon: ArrowsRightLeftIcon,
        href: '/data-transfer',
        color: 'bg-blue-500',
        permission: 'settings.dataTransfer'
    },
    {
        title: 'Notifications',
        description: 'Configure email and push notifications',
        icon: BellIcon,
        href: '/settings/notifications',
        color: 'bg-red-500',
        permission: 'settings.notifications'
    },
    {
        title: 'Custom Fields',
        description: 'Add custom fields to your CRM entities',
        icon: PlusCircleIcon,
        href: '/settings/custom-fields',
        color: 'bg-pink-500',
        permission: 'settings.customFields'
    },
    {
        title: 'Security Settings',
        description: 'Two-factor auth, IP restrictions, audit logs',
        icon: LockClosedIcon,
        href: '/settings/security',
        color: 'bg-red-500',
        permission: 'settings.security'
    },
    {
        title: 'Company Profile',
        description: 'Update company information and branding',
        icon: BuildingOfficeIcon,
        href: '/settings/company',
        color: 'bg-cyan-500',
        permission: 'settings.company'
    },
    {
        title: 'Email Templates',
        description: 'Create and manage email templates',
        icon: DocumentTextIcon,
        href: '/settings/templates',
        color: 'bg-yellow-500',
        permission: 'settings.emailTemplates'
    },
    {
        title: 'Business Hours',
        description: 'Set working hours and holidays',
        icon: ClockIcon,
        href: '/settings/business-hours',
        color: 'bg-indigo-500',
        permission: 'settings.businessHours'
    }
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

                        return (
                            <Link key={section.href} href={section.href}>
                                {CardContent}
                            </Link>
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
