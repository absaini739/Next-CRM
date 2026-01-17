import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePermissions } from '@/lib/usePermissions';
import { Menu, Transition } from '@headlessui/react';
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
    HomeIcon,
    CalendarIcon,
    PhoneIcon,
    ShieldCheckIcon,
    BellIcon,
    PlusCircleIcon,
    LockClosedIcon,
    ClockIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

export default function Header() {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const { hasPermission } = usePermissions();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const quickCreateItems = useMemo(() => [
        { name: 'Lead', icon: FunnelIcon, href: '/leads/new', permission: 'leads' },
        { name: 'Quote', icon: DocumentTextIcon, href: '/quotes/new', permission: 'quotes' },
        { name: 'Email', icon: EnvelopeIcon, href: '/emails/new', permission: 'email' },
        { name: 'Person', icon: UsersIcon, href: '/persons/new', permission: 'persons' },
        { name: 'Organization', icon: BuildingOfficeIcon, href: '/organizations/new', permission: 'organizations' },
        { name: 'Product', icon: ShoppingBagIcon, href: '/products/new', permission: 'products' },
        { name: 'Role', icon: Cog6ToothIcon, href: '/settings/roles/new', permission: 'settings.roles' },
        { name: 'User', icon: UserCircleIcon, href: '/settings/users/new', permission: 'settings.users' },
    ], []);

    const searchableItems = useMemo(() => [
        // Sidebar Navigation
        { name: 'Dashboard', href: '/', icon: HomeIcon, permission: 'dashboard', category: 'Navigation' },
        { name: 'Persons', href: '/persons', icon: UsersIcon, permission: 'persons', category: 'Navigation' },
        { name: 'Organizations', href: '/organizations', icon: BuildingOfficeIcon, permission: 'organizations', category: 'Navigation' },
        { name: 'Leads', href: '/leads', icon: FunnelIcon, permission: 'leads', category: 'Navigation' },
        { name: 'Deals', href: '/deals', icon: ShoppingBagIcon, permission: 'deals', category: 'Navigation' },
        { name: 'Products', href: '/products', icon: ShoppingBagIcon, permission: 'products', category: 'Navigation' },
        { name: 'Quotes', href: '/quotes', icon: DocumentTextIcon, permission: 'quotes', category: 'Navigation' },
        { name: 'Tasks', href: '/tasks', icon: CalendarIcon, permission: 'tasks', category: 'Navigation' },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon, permission: 'calendar', category: 'Navigation' },
        { name: 'Activities', href: '/activities', icon: CalendarIcon, permission: 'activities', category: 'Navigation' },
        { name: 'VoIP', href: '/voip', icon: PhoneIcon, permission: 'voip', category: 'Navigation' },
        { name: 'Email', href: '/emails', icon: EnvelopeIcon, permission: 'email', category: 'Navigation' },

        // Settings
        { name: 'My Permissions', href: '/settings/my-permissions', icon: ShieldCheckIcon, category: 'Settings' },
        { name: 'User Management', href: '/settings/users', icon: UsersIcon, permission: 'settings.users', category: 'Settings' },
        { name: 'Roles & Permissions', href: '/settings/roles', icon: ShieldCheckIcon, permission: 'settings.roles', category: 'Settings' },
        { name: 'Pipeline Configuration', href: '/pipelines', icon: FunnelIcon, permission: 'settings.pipelines', category: 'Settings' },
        { name: 'Email Integration', href: '/settings/email', icon: EnvelopeIcon, permission: 'settings.emailIntegration', category: 'Settings' },
        { name: 'Data Transfer', href: '/data-transfer', icon: ArrowsRightLeftIcon, permission: 'settings.dataTransfer', category: 'Settings' },
        { name: 'Notifications', href: '/settings/notifications', icon: BellIcon, permission: 'settings.notifications', category: 'Settings' },
        { name: 'Custom Fields', href: '/settings/custom-fields', icon: PlusCircleIcon, permission: 'settings.customFields', category: 'Settings' },
        { name: 'Security Settings', href: '/settings/security', icon: LockClosedIcon, permission: 'settings.security', category: 'Settings' },
        { name: 'Company Profile', href: '/settings/company', icon: BuildingOfficeIcon, permission: 'settings.company', category: 'Settings' },
        { name: 'Email Templates', href: '/settings/templates', icon: DocumentTextIcon, permission: 'settings.emailTemplates', category: 'Settings' },
        { name: 'Business Hours', href: '/settings/business-hours', icon: ClockIcon, permission: 'settings.businessHours', category: 'Settings' },
    ], []);

    const fetchNotifications = async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count')
            ]);
            setNotifications(notifsRes.data);
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const markRead = async (id: number, taskId?: number, leadId?: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
            if (taskId) {
                router.push(`/tasks/${taskId}`);
            } else if (leadId) {
                router.push(`/leads-list?leadId=${leadId}`);
            }
        } catch (error) {
            console.error('Failed to mark notification as read');
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const filtered = searchableItems.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(searchQuery.toLowerCase());
                const hasPerm = !item.permission || hasPermission(item.permission);
                return matchesSearch && hasPerm;
            });
            setSearchResults(filtered);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchQuery, hasPermission, searchableItems]);

    // Handle clicking outside of search results to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            router.push(searchResults[0].href);
            setShowResults(false);
            setSearchQuery('');
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
                <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
                    <form onSubmit={handleSearch} className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim() && setShowResults(true)}
                            placeholder="Mega Search (Modules, Settings...)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                        />
                    </form>

                    {/* Search Results Dropdown */}
                    <Transition
                        show={showResults}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-[400px] overflow-y-auto z-50">
                            {searchResults.length > 0 ? (
                                <div className="py-2">
                                    {searchResults.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={`${item.href}-${index}`}
                                                onClick={() => {
                                                    router.push(item.href);
                                                    setShowResults(false);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-gray-100 dark:border-slate-700 last:border-0"
                                            >
                                                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg mr-4 text-gray-400 dark:text-slate-500">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-slate-400 italic">
                                                        {item.category}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </Transition>
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
                                        const hasPerm = !item.permission || hasPermission(item.permission);
                                        if (!hasPerm) return null;

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

                    {/* Notifications */}
                    <Menu as="div" className="relative" ref={notificationRef}>
                        <Menu.Button className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                            <BellIcon className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </span>
                            )}
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
                            <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                                onClick={() => markRead(notif.id, notif.task_id, notif.lead_id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800 dark:text-slate-200">{notif.message}</p>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                                                            {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 dark:text-slate-500">
                                            No notifications yet
                                        </div>
                                    )}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

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
