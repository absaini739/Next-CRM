'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import {
    UsersIcon,
    ShieldCheckIcon,
    FunnelIcon,
    EnvelopeIcon,
    ArrowsRightLeftIcon,
    BoltIcon,
    BellIcon,
    WrenchScrewdriverIcon,
    CubeIcon,
    LockClosedIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ClockIcon,
    TagIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface SettingSection {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    route?: string;
}

const settingSections: SettingSection[] = [
    {
        id: 'users',
        title: 'User Management',
        description: 'Manage users, roles, and permissions',
        icon: UsersIcon,
        color: 'bg-blue-100 text-blue-600',
        route: '/settings/users'
    },
    {
        id: 'roles',
        title: 'Roles & Permissions',
        description: 'Configure access control and security',
        icon: ShieldCheckIcon,
        color: 'bg-green-100 text-green-600',
        route: '/roles'
    },
    {
        id: 'pipelines',
        title: 'Pipeline Configuration',
        description: 'Customize lead and deal pipelines',
        icon: FunnelIcon,
        color: 'bg-purple-100 text-purple-600',
        route: '/pipelines'
    },
    {
        id: 'email',
        title: 'Email Integration',
        description: 'Connect your email accounts',
        icon: EnvelopeIcon,
        color: 'bg-orange-100 text-orange-600',
        route: '/settings/email'
    },
    {
        id: 'data-transfer',
        title: 'Data Transfer',
        description: 'Import and export your CRM data',
        icon: ArrowsRightLeftIcon,
        color: 'bg-indigo-100 text-indigo-600',
        route: '/data-transfer'
    },
    {
        id: 'automation',
        title: 'Workflow Automation',
        description: 'Create automated workflows and triggers',
        icon: BoltIcon,
        color: 'bg-yellow-100 text-yellow-600',
        route: '/settings/automation'
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Configure email and push notifications',
        icon: BellIcon,
        color: 'bg-red-100 text-red-600',
        route: '/settings/notifications'
    },
    {
        id: 'custom-fields',
        title: 'Custom Fields',
        description: 'Add custom fields to your CRM entities',
        icon: WrenchScrewdriverIcon,
        color: 'bg-pink-100 text-pink-600',
        route: '/settings/custom-fields'
    },
    {
        id: 'integrations',
        title: 'API & Integrations',
        description: 'Connect third-party apps and services',
        icon: CubeIcon,
        color: 'bg-teal-100 text-teal-600',
        route: '/settings/integrations'
    },
    {
        id: 'security',
        title: 'Security Settings',
        description: 'Two-factor auth, IP restrictions, audit logs',
        icon: LockClosedIcon,
        color: 'bg-gray-100 text-gray-600',
        route: '/settings/security'
    },
    {
        id: 'company',
        title: 'Company Profile',
        description: 'Update company information and branding',
        icon: BuildingOfficeIcon,
        color: 'bg-cyan-100 text-cyan-600',
        route: '/settings/company'
    },
    {
        id: 'billing',
        title: 'Billing & Subscription',
        description: 'Manage your subscription and invoices',
        icon: CurrencyDollarIcon,
        color: 'bg-emerald-100 text-emerald-600',
        route: '/settings/billing'
    },
    {
        id: 'localization',
        title: 'Localization',
        description: 'Language, timezone, and currency settings',
        icon: GlobeAltIcon,
        color: 'bg-violet-100 text-violet-600',
        route: '/settings/localization'
    },
    {
        id: 'reports',
        title: 'Reports & Analytics',
        description: 'Configure dashboards and custom reports',
        icon: ChartBarIcon,
        color: 'bg-lime-100 text-lime-600',
        route: '/settings/reports'
    },
    {
        id: 'templates',
        title: 'Email Templates',
        description: 'Create and manage email templates',
        icon: DocumentTextIcon,
        color: 'bg-amber-100 text-amber-600',
        route: '/settings/templates'
    },
    {
        id: 'business-hours',
        title: 'Business Hours',
        description: 'Set working hours and holidays',
        icon: ClockIcon,
        color: 'bg-rose-100 text-rose-600',
        route: '/settings/business-hours'
    },
    {
        id: 'tags',
        title: 'Tags & Categories',
        description: 'Manage tags and categorization',
        icon: TagIcon,
        color: 'bg-fuchsia-100 text-fuchsia-600',
        route: '/settings/tags'
    },
    {
        id: 'advanced',
        title: 'Advanced Settings',
        description: 'Database, backups, and system configuration',
        icon: Cog6ToothIcon,
        color: 'bg-slate-100 text-slate-600',
        route: '/settings/advanced'
    },
];

export default function SettingsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSections = settingSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="text-blue-600">Dashboard</span>
                        <span className="mx-2">/</span>
                        <span>Settings</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-600">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
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
                        <p className="text-gray-500">No settings found matching your search.</p>
                    </div>
                )}

                {/* Info Card */}
                <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                Settings Configuration
                            </h3>
                            <p className="text-sm text-blue-700">
                                Advanced settings pages will be implemented in the next phase.
                                Core CRM functionality is fully operational!
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
