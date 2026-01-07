'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
    PhoneIcon,
    PhoneArrowUpRightIcon,
    PhoneArrowDownLeftIcon,
    PhoneXMarkIcon,
    ClockIcon,
    UserIcon
} from '@heroicons/react/24/outline';

export default function VoIPPage() {
    const [activeCall, setActiveCall] = useState<any>(null);
    const [callHistory, setCallHistory] = useState([
        {
            id: 1,
            contact: 'John Doe',
            number: '+1 (555) 123-4567',
            type: 'outgoing',
            duration: '5:32',
            time: '10 minutes ago',
            status: 'completed'
        },
        {
            id: 2,
            contact: 'Jane Smith',
            number: '+1 (555) 987-6543',
            type: 'incoming',
            duration: '12:45',
            time: '1 hour ago',
            status: 'completed'
        },
        {
            id: 3,
            contact: 'Unknown',
            number: '+1 (555) 456-7890',
            type: 'missed',
            duration: '0:00',
            time: '3 hours ago',
            status: 'missed'
        },
    ]);
    const [dialNumber, setDialNumber] = useState('');
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        let interval: any;
        if (activeCall) {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeCall]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDial = (number: string) => {
        setActiveCall({
            number,
            contact: 'Calling...',
            status: 'connecting'
        });
        setTimeout(() => {
            setActiveCall((prev: any) => ({ ...prev, status: 'connected' }));
        }, 2000);
    };

    const handleEndCall = () => {
        setActiveCall(null);
        setDialNumber('');
    };

    const dialPadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">VoIP Phone</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Make and manage calls directly from your CRM
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Dialer */}
                    <div className="lg:col-span-1">
                        <Card title="Dialer">
                            {activeCall ? (
                                <div className="text-center space-y-6">
                                    <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                        <UserIcon className="h-12 w-12 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{activeCall.contact}</h3>
                                        <p className="text-sm text-gray-600">{activeCall.number}</p>
                                        <Badge variant={activeCall.status === 'connected' ? 'success' : 'warning'} className="mt-2">
                                            {activeCall.status}
                                        </Badge>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {formatDuration(callDuration)}
                                    </div>
                                    <Button
                                        variant="danger"
                                        onClick={handleEndCall}
                                        className="w-full flex items-center justify-center"
                                    >
                                        <PhoneXMarkIcon className="h-5 w-5 mr-2" />
                                        End Call
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Input
                                        value={dialNumber}
                                        onChange={(e) => setDialNumber(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="text-center text-lg"
                                    />

                                    <div className="grid grid-cols-3 gap-2">
                                        {dialPadNumbers.map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setDialNumber(dialNumber + num)}
                                                className="h-14 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-semibold transition-colors"
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="primary"
                                        onClick={() => handleDial(dialNumber)}
                                        disabled={!dialNumber}
                                        className="w-full flex items-center justify-center"
                                    >
                                        <PhoneIcon className="h-5 w-5 mr-2" />
                                        Call
                                    </Button>

                                    <Select
                                        label="Quick Dial"
                                        options={[
                                            { value: '', label: 'Select a contact...' },
                                            { value: '+15551234567', label: 'John Doe - +1 (555) 123-4567' },
                                            { value: '+15559876543', label: 'Jane Smith - +1 (555) 987-6543' },
                                        ]}
                                        onChange={(e) => e.target.value && handleDial(e.target.value)}
                                    />
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Call History */}
                    <div className="lg:col-span-2">
                        <Card title="Recent Calls">
                            <div className="space-y-3">
                                {callHistory.map((call) => (
                                    <div
                                        key={call.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${call.type === 'outgoing' ? 'bg-blue-100' :
                                                    call.type === 'incoming' ? 'bg-green-100' :
                                                        'bg-red-100'
                                                }`}>
                                                {call.type === 'outgoing' ? (
                                                    <PhoneArrowUpRightIcon className={`h-5 w-5 ${call.type === 'outgoing' ? 'text-blue-600' : ''
                                                        }`} />
                                                ) : call.type === 'incoming' ? (
                                                    <PhoneArrowDownLeftIcon className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <PhoneXMarkIcon className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{call.contact}</h4>
                                                <p className="text-sm text-gray-600">{call.number}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                {call.duration}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{call.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Call Statistics" className="mt-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">24</div>
                                    <div className="text-sm text-gray-600 mt-1">Total Calls Today</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">18</div>
                                    <div className="text-sm text-gray-600 mt-1">Answered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-600">3:45</div>
                                    <div className="text-sm text-gray-600 mt-1">Avg Duration</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
