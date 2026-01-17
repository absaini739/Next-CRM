'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    EllipsisVerticalIcon,
    PencilSquareIcon,
    PlusIcon,
    ArrowPathRoundedSquareIcon, // Changed from ArrowPathIcon
    UserPlusIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';

interface LeadActionDropdownProps {
    onAction: (actionId: string, lead: any) => void;
    lead: any;
}

export default function LeadActionDropdown({ onAction, lead }: LeadActionDropdownProps) {
    const actions = [
        { id: 'update', name: 'Update Lead', icon: PencilSquareIcon },
        { id: 'follow_up', name: 'Follow Up', icon: ArrowPathRoundedSquareIcon },
        { id: 'assign', name: 'Assign Lead', icon: UserPlusIcon },
        { id: 'priority', name: 'Update Lead Priority', icon: ChevronUpIcon },
    ];

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items anchor="bottom end" className="w-56 divide-y divide-gray-100 dark:divide-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100 dark:border-slate-800 [--anchor-gap:8px]">
                    <div className="px-1 py-1">
                        {actions.map((action) => (
                            <Menu.Item key={action.id}>
                                {({ active }) => (
                                    <button
                                        onClick={() => onAction(action.id, lead)}
                                        className={`${active ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-slate-300'
                                            } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-colors`}
                                    >
                                        <action.icon
                                            className={`${active ? 'text-white' : 'text-gray-400 dark:text-slate-500'
                                                } mr-3 h-5 w-5 shrink-0 transition-colors`}
                                            aria-hidden="true"
                                        />
                                        <span className="font-medium">{action.name}</span>
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
