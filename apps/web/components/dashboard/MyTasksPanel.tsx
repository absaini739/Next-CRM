'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    UserCircleIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface Task {
    id: number;
    title: string;
    status: string;
    due_date: string;
    priority: string;
    assigned_to: { id: number; name: string };
    assigned_by: { id: number; name: string };
}

export default function MyTasksPanel() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'assigned_to_me' | 'assigned_by_me'>('assigned_to_me');

    const isAdminOrManager = user?.role?.name === 'Administrator' || user?.role?.name === 'Manager' || user?.role?.name === 'Lead';

    useEffect(() => {
        fetchTasks();
    }, [mode]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tasks/my-tasks?mode=${mode}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (task: Task) => {
        const newStatus = task.status === 'completed' ? 'to_do' : 'completed';
        try {
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            toast.error('Failed to update task status');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (dateStr: string) => {
        return new Date(dateStr) < new Date() && tasks.find(t => t.due_date === dateStr)?.status !== 'completed';
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    Task Overview
                </h3>
                {isAdminOrManager && (
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('assigned_to_me')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'assigned_to_me'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Assigned to Me
                        </button>
                        <button
                            onClick={() => setMode('assigned_by_me')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'assigned_by_me'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Assigned by Me
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-sm">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10 text-center">
                        <ClockIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">No tasks found for this view.</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${task.status === 'completed'
                                ? 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800'
                                : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-sm'
                                }`}
                        >
                            <button
                                onClick={() => toggleStatus(task)}
                                className={`flex-shrink-0 transition-colors ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
                                    }`}
                            >
                                {task.status === 'completed' ? (
                                    <CheckCircleSolidIcon className="h-6 w-6" />
                                ) : (
                                    <CheckCircleIcon className="h-6 w-6" />
                                )}
                            </button>

                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => window.location.href = `/tasks/${task.id}`}
                            >
                                <p className={`text-sm font-medium truncate group-hover:text-blue-600 transition-colors ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-slate-100'
                                    }`}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <ClockIcon className={`h-3 w-3 ${isOverdue(task.due_date) ? 'text-red-500' : ''}`} />
                                        {formatDate(task.due_date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {mode === 'assigned_to_me' ? (
                                            <>
                                                <UserCircleIcon className="h-3 w-3" />
                                                By: {task.assigned_by.name}
                                            </>
                                        ) : (
                                            <>
                                                <UserPlusIcon className="h-3 w-3" />
                                                To: {task.assigned_to.name}
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'high' || task.priority === 'urgent'
                                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}>
                                {task.priority}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800 text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => window.location.href = '/tasks'}
                >
                    View All Tasks
                </Button>
            </div>
        </Card>
    );
}
