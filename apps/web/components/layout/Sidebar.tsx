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

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Persons', href: '/persons', icon: UsersIcon },
    { name: 'Organizations', href: '/organizations', icon: BuildingOfficeIcon },
    { name: 'Leads', href: '/leads', icon: FunnelIcon },
    { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Quotes', href: '/quotes', icon: DocumentTextIcon },
    { name: 'Tasks', href: '/tasks', icon: CalendarIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Activities', href: '/activities', icon: CalendarIcon },
    { name: 'Pipelines', href: '/pipelines', icon: FunnelIcon },
    { name: 'VoIP', href: '/voip', icon: PhoneIcon },
    { name: 'Email', href: '/emails', icon: EnvelopeIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

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
                {navigation.map((item) => {
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
