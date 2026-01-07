'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, CalendarIcon, PhoneIcon, EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ActivitiesPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/activities');
            setActivities(response.data);
        } catch (error) {
            toast.error('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'call':
                return <PhoneIcon className="h-5 w-5" />;
            case 'email':
                return <EnvelopeIcon className="h-5 w-5" />;
            case 'meeting':
                return <CalendarIcon className="h-5 w-5" />;
            default:
                return <DocumentTextIcon className="h-5 w-5" />;
        }
    };

    const getActivityBadge = (type: string) => {
        const variants: any = {
            call: 'info',
            email: 'warning',
            meeting: 'success',
            task: 'default',
            note: 'default',
        };
        return variants[type] || 'default';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track tasks, calls, meetings, and notes
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/activities/new')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Log Activity
                    </Button>
                </div>

                <Card>
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                        <Badge variant={getActivityBadge(activity.type)}>
                                            {activity.type}
                                        </Badge>
                                        {activity.completed && (
                                            <Badge variant="success">Completed</Badge>
                                        )}
                                    </div>
                                    {activity.description && (
                                        <p className="text-sm text-gray-600">{activity.description}</p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                        {activity.start_at && (
                                            <span>{new Date(activity.start_at).toLocaleString()}</span>
                                        )}
                                        <span>Created {new Date(activity.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No activities yet
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
