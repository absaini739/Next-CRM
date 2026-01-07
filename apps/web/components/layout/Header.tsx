'use client';

import { useAuth } from '@/context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            {/* Breadcrumbs / Page Title - can be enhanced later */}
            <div className="flex-1">
                {/* Page Title removed as requested */}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name || 'Admin'}</span>

                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        <UserCircleIcon className="w-8 h-8 text-gray-400" />
                        <ChevronDownIcon className="w-4 h-4" />
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
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={logout}
                                            className={`${active ? 'bg-gray-100' : ''
                                                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
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
        </header>
    );
}
