'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ActivityForm from '@/components/forms/ActivityForm';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    ClockIcon,
    PencilSquareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface Activity {
    id: number;
    title: string;
    description?: string;
    type: 'call' | 'meeting' | 'task' | 'note' | 'email';
    start_at?: string;
    end_at?: string;
    completed: boolean;
    created_at: string;
    user: { id: number; name: string };
    person?: { id: number; name: string };
    lead?: { id: number; title: string };
    deal?: { id: number; title: string };
}

const ACTIVITY_TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string }> = {
    call: { icon: PhoneIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    meeting: { icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    task: { icon: CheckCircleIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    note: { icon: ChatBubbleLeftRightIcon, color: 'text-gray-600', bg: 'bg-gray-100' },
    email: { icon: EnvelopeIcon, color: 'text-green-600', bg: 'bg-green-100' },
};

export default function ActivitiesPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

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

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) return;
        try {
            await api.delete(`/activities/${id}`);
            toast.success('Activity deleted');
            fetchActivities();
        } catch (error) {
            toast.error('Failed to delete activity');
        }
    };

    const toggleComplete = async (activity: Activity) => {
        try {
            await api.put(`/activities/${activity.id}`, {
                ...activity,
                completed: !activity.completed
            });
            toast.success(`Activity marked as ${!activity.completed ? 'completed' : 'pending'}`);
            fetchActivities();
        } catch (error) {
            toast.error('Failed to update activity');
        }
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === '' || activity.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading activities...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Activities</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                            Track all interactions and meetings
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowForm(true)}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Log Activity
                    </Button>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-sm">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search activities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="call">Calls</option>
                            <option value="meeting">Meetings</option>
                            <option value="task">Tasks</option>
                            <option value="note">Notes</option>
                            <option value="email">Emails</option>
                        </select>
                    </div>
                </Card>

                {/* Activity List */}
                <div className="space-y-4">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => {
                            const config = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.note;
                            const Icon = config.icon;

                            return (
                                <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                                            <Icon className="h-6 w-6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-semibold text-lg truncate ${activity.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                    {activity.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleComplete(activity)}
                                                        className={`p-1 rounded-md transition-colors ${activity.completed ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                                        title={activity.completed ? "Mark as Pending" : "Mark as Completed"}
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedActivity(activity);
                                                            setShowForm(true);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(activity.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {activity.description && (
                                                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                            )}

                                            <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 dark:text-slate-500">
                                                <div className="flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    {formatDateTime(activity.start_at)}
                                                </div>

                                                {activity.person && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium mr-1 text-gray-700 dark:text-gray-300">Contact:</span>
                                                        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => router.push(`/persons/${activity.person?.id}`)}>
                                                            {activity.person.name}
                                                        </span>
                                                    </div>
                                                )}

                                                {activity.lead && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium mr-1 text-gray-700 dark:text-gray-300">Lead:</span>
                                                        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => router.push(`/leads/${activity.lead?.id}`)}>
                                                            {activity.lead.title}
                                                        </span>
                                                    </div>
                                                )}

                                                {activity.deal && (
                                                    <div className="flex items-center">
                                                        <span className="font-medium mr-1 text-gray-700 dark:text-gray-300">Deal:</span>
                                                        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => router.push(`/deals/${activity.deal?.id}`)}>
                                                            {activity.deal.title}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center ml-auto">
                                                    <span className="mr-1 italic text-gray-400">Logged by:</span>
                                                    {activity.user.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
                            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activities found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
                                Get started by logging your first activity.
                            </p>
                            <div className="mt-6">
                                <Button
                                    variant="primary"
                                    onClick={() => setShowForm(true)}
                                >
                                    Log Activity
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <ActivityForm
                    activity={selectedActivity}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedActivity(null);
                    }}
                    onSuccess={() => {
                        fetchActivities();
                        setShowForm(false);
                        setSelectedActivity(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
