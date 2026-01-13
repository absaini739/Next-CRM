'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    UserCircleIcon,
    KeyIcon,
    EnvelopeIcon,
    UserIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
    const { user, fetchMe } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await api.put('/auth/profile', profileData);
            await fetchMe(); // Refresh user data in context
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            await api.put('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password changed successfully' });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        Manage your personal information and account security.
                    </p>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <ShieldCheckIcon className="h-5 w-5" />
                        ) : (
                            <ExclamationTriangleIcon className="h-5 w-5" />
                        )}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <UserCircleIcon className="h-5 w-5 text-blue-500" />
                                    Personal Information
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 cursor-not-allowed outline-none transition-all"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 cursor-not-allowed outline-none transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                                        Note: Your name and email can only be changed by an administrator.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <KeyIcon className="h-5 w-5 text-pink-500" />
                                    Security & Password
                                </h2>
                            </div>
                            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Account Details Sidebar */}
                    <div className="space-y-6">
                        <section className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{user?.name}</h3>
                                    <p className="text-blue-100 text-sm uppercase tracking-wider font-semibold">
                                        {user?.role?.name || 'User'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm space-y-2 text-blue-50/80">
                                <div className="flex justify-between border-t border-white/10 pt-2">
                                    <span>Status</span>
                                    <span className="font-medium text-white">{user?.status || 'Active'}</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2">
                                    <span>Joined</span>
                                    <span className="font-medium text-white">
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-1">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                Security Tip
                            </h4>
                            <p className="text-xs text-orange-700 dark:text-orange-500/80 leading-relaxed">
                                Use a strong password with symbols, numbers, and capital letters to keep your account safe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
