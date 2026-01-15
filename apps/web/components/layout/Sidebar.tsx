'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    HomeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    FunnelIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    DocumentTextIcon,
    CalendarIcon,
    Cog6ToothIcon,
    PhoneIcon,
    EnvelopeIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '@/lib/usePermissions';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, permission: 'dashboard' },
    { name: 'Persons', href: '/persons', icon: UsersIcon, permission: 'persons' },
    { name: 'Organizations', href: '/organizations', icon: BuildingOfficeIcon, permission: 'organizations' },
    { name: 'Leads', href: '/leads', icon: FunnelIcon, permission: 'leads' },
    { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon, permission: 'deals' },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon, permission: 'products' },
    { name: 'Quotes', href: '/quotes', icon: DocumentTextIcon, permission: 'quotes' },
    { name: 'Tasks', href: '/tasks', icon: CalendarIcon, permission: 'tasks' },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon, permission: 'calendar' },
    { name: 'Activities', href: '/activities', icon: CalendarIcon, permission: 'activities' },
    {
        name: 'VoIP',
        href: '/voip',
        icon: PhoneIcon,
        permission: 'voip',
        children: [
            { name: 'Dashboard', href: '/voip' },
            { name: 'Providers', href: '/voip/providers' },
            { name: 'Trunks', href: '/voip/trunks' },
            { name: 'Routes', href: '/voip/routes' },
            { name: 'Recordings', href: '/voip/recordings' },
        ]
    },
    { name: 'Email', href: '/emails', icon: EnvelopeIcon, permission: 'email' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }, // Always show settings, but content inside will be filtered
];


export default function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const { hasPermission } = usePermissions();

    const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

    return (
        <div
            suppressHydrationWarning
            className={`flex flex-col bg-slate-900 dark:bg-slate-950 min-h-screen transition-all duration-300 ease-in-out pt-16 border-r border-slate-800 dark:border-slate-800 ${isExpanded ? 'w-64' : 'w-16'
                }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-300 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white dark:hover:text-slate-100'
                                }`}
                            title={!isExpanded ? item.name : undefined}
                        >
                            <Icon className={`h-6 w-6 flex-shrink-0 ${isExpanded ? 'mr-3' : ''}`} />
                            {isExpanded && (
                                <span className="whitespace-nowrap overflow-hidden">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
