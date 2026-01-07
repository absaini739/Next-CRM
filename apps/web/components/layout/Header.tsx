'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    MoonIcon,
    SunIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    FunnelIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ShoppingBagIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function Header() {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const quickCreateItems = [
        { name: 'Lead', icon: FunnelIcon, href: '/leads/new' },
        { name: 'Quote', icon: DocumentTextIcon, href: '/quotes/new' },
        { name: 'Email', icon: EnvelopeIcon, href: '/emails/new' },
        { name: 'Person', icon: UsersIcon, href: '/persons/new' },
        { name: 'Organization', icon: BuildingOfficeIcon, href: '/organizations/new' },
        { name: 'Product', icon: ShoppingBagIcon, href: '/products/new' },
        { name: 'Role', icon: Cog6ToothIcon, href: '/settings/roles/new' },
        { name: 'User', icon: UserCircleIcon, href: '/settings/users/new' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // TODO: Implement global search
            console.log('Searching for:', searchQuery);
        }
    };

    const getUserInitial = () => {
        return user?.name?.charAt(0).toUpperCase() || 'A';
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 h-16 z-50 transition-all duration-300">
            <div className="flex items-center justify-between px-6 h-full">
                {/* Left: Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight"
                >
                    ispecia
                </Link>

                {/* Center: Search Bar */}
                <div className="flex-1 max-w-2xl mx-8">
                    <form onSubmit={handleSearch} className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Mega Search"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                        />
                    </form>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-3">
                    {/* Quick Create Menu */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                            <PlusIcon className="h-5 w-5" />
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
                                <div className="py-2">
                                    {quickCreateItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Menu.Item key={item.name}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => router.push(item.href)}
                                                        className={`${active ? 'bg-gray-50 dark:bg-slate-700' : ''
                                                            } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700`}
                                                    >
                                                        <Icon className="w-5 h-5 mr-3 text-gray-400 dark:text-slate-500" />
                                                        {item.name}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        );
                                    })}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {darkMode ? (
                            <SunIcon className="h-5 w-5" />
                        ) : (
                            <MoonIcon className="h-5 w-5" />
                        )}
                    </button>

                    {/* User Menu */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center justify-center w-10 h-10 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors">
                            {getUserInitial()}
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
                                <div className="py-2">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email || ''}</p>
                                    </div>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={logout}
                                                className={`${active ? 'bg-gray-50 dark:bg-slate-700' : ''
                                                    } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700`}
                                            >
                                                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                                                Logout
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
}
