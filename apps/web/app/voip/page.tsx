'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    PhoneIcon,
    ServerIcon,
    ArrowPathIcon,
    MicrophoneIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import callManager from '@/lib/voip/callManager';

function VoIPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [stats, setStats] = useState({
        providers: 0,
        trunks: 0,
        routes: 0,
        recordings: 0,
    });

    useEffect(() => {
        fetchStats();
        // Pre-fill phone number from URL parameter
        const dialParam = searchParams.get('dial');
        if (dialParam) {
            setPhoneNumber(dialParam);
        }
    }, [searchParams]);

    const fetchStats = async () => {
        try {
            const [providers, trunks, routes, recordings] = await Promise.all([
                api.get('/voip/providers'),
                api.get('/voip/trunks'),
                api.get('/voip/routes'),
                api.get('/voip/recordings'),
            ]);

            setStats({
                providers: providers.data.length,
                trunks: trunks.data.length,
                routes: routes.data.length,
                recordings: recordings.data.length,
            });
        } catch (error) {
            toast.error('Failed to load VoIP stats');
        }
    };

    const sections = [
        {
            title: 'VoIP Providers',
            description: 'Manage VoIP service providers (Twilio, Telnyx, Generic SIP)',
            icon: PhoneIcon,
            count: stats.providers,
            href: '/voip/providers',
            color: 'blue',
        },
        {
            title: 'VoIP Trunks',
            description: 'Configure SIP trunks and connection details',
            icon: ServerIcon,
            count: stats.trunks,
            href: '/voip/trunks',
            color: 'green',
        },
        {
            title: 'Inbound Routes',
            description: 'Define how incoming calls are routed based on DID patterns',
            icon: ArrowPathIcon,
            count: stats.routes,
            href: '/voip/routes',
            color: 'purple',
        },
        {
            title: 'Call Recordings',
            description: 'View and manage recorded calls',
            icon: MicrophoneIcon,
            count: stats.recordings,
            href: '/voip/recordings',
            color: 'orange',
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: any = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">VoIP Management</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Manage your VoIP infrastructure and call routing
                </p>
            </div>

            {/* Quick Dialer */}
            <Card title="Quick Dialer" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter phone number to call"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={async () => {
                            if (phoneNumber) {
                                try {
                                    await callManager.makeCall(phoneNumber);
                                    toast.success(`Calling ${phoneNumber}...`);
                                } catch (error: any) {
                                    toast.error(error.message || 'Failed to start call');
                                }
                            } else {
                                toast.error('Please enter a phone number');
                            }
                        }}
                        disabled={!phoneNumber}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <PhoneIcon className="h-5 w-5" />
                        Call
                    </button>
                </div>
                {phoneNumber && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                        Ready to call: <span className="font-semibold text-gray-900 dark:text-slate-100">{phoneNumber}</span>
                    </p>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link key={section.href} href={section.href} className="block">
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className={`inline-flex p-3 rounded-lg ${getColorClasses(section.color)}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">
                                            {section.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                                            {section.description}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                                {section.count}
                                            </span>
                                            <ArrowRightIcon className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <Card title="Quick Start Guide">
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                            1
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-slate-100">Create a VoIP Provider</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Set up your Twilio, Telnyx, or Generic SIP provider with credentials
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                            2
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-slate-100">Configure a Trunk</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Create a SIP trunk linked to your provider for call handling
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                            3
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-slate-100">Set Up Inbound Routes</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Define how incoming calls should be routed based on phone numbers
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                            4
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-slate-100">Start Making Calls</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Your VoIP system is ready! View call recordings in the recordings section
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default function VoIPPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <VoIPContent />
            </Suspense>
        </DashboardLayout>
    );
}
