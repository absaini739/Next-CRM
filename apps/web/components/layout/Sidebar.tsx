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
import { useAuth } from '@/context/AuthContext';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, permission: 'dashboard' },
    { name: 'Persons', href: '/persons', icon: UsersIcon, permission: 'contacts.persons' },
    { name: 'Organizations', href: '/organizations', icon: BuildingOfficeIcon, permission: 'contacts.organizations' },
    { name: 'Leads', href: '/leads', icon: FunnelIcon, permission: 'leads' },
    { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon, permission: 'deals' },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon, permission: 'products' },
    { name: 'Quotes', href: '/quotes', icon: DocumentTextIcon, permission: 'quotes' },
    { name: 'Activities', href: '/activities', icon: CalendarIcon, permission: 'activities' },
    { name: 'Pipelines', href: '/pipelines', icon: FunnelIcon, permission: 'settings.lead.pipelines' },
    { name: 'VoIP', href: '/voip', icon: PhoneIcon, permission: 'voip' },
    { name: 'Email', href: '/emails', icon: EnvelopeIcon, permission: 'mail' },
    { name: 'Data Transfer', href: '/data-transfer', icon: ArrowsRightLeftIcon, permission: 'settings.otherSettings.dataTransfer' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }, // Always show settings, but content inside will be filtered
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const { user } = useAuth();

    const hasPermission = (permissionPath?: string) => {
        if (!permissionPath) return true;
        if (!user || !user.role) return false;

        // Administrator has all permissions
        if (user.role.name.toLowerCase() === 'administrator' || user.role.permissions?.all === true) {
            return true;
        }

        const permissions = user.role.permissions;
        if (!permissions) return false;

        // Split path (e.g., 'contacts.persons')
        const parts = permissionPath.split('.');

        let current = permissions;
        for (const part of parts) {
            if (current[part]) {
                // If it's the last part and it's an array of permissions (like ['view', 'create'])
                if (Array.isArray(current[part])) {
                    return current[part].includes('view');
                }
                // If it's an object, keep going
                current = current[part];
            } else {
                return false;
            }
        }

        // If we reached here, and it's an array or has 'view'
        return true;
    };

    const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

    return (
        <div
            className={`flex flex-col bg-gray-900 min-h-screen transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'
                }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-2 bg-gray-800">
                {isExpanded ? (
                    <h1 className="text-xl font-bold text-white">ispecia</h1>
                ) : (
                    <span className="text-xl font-bold text-white">i</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
