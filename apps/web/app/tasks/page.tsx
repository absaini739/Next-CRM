'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TaskForm from '@/components/forms/TaskForm';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    ClockIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Task {
    id: number;
    title: string;
    description?: string;
    task_type: string;
    priority: string;
    status: string;
    due_date?: string;
    due_time?: string;
    estimated_duration?: number;
    actual_duration?: number;
    assigned_to: { id: number; name: string; email: string };
    assigned_by: { id: number; name: string };
    person?: { id: number; name: string };
    lead?: { id: number; title: string };
    deal?: { id: number; title: string };
    comments?: any[];
    time_logs?: any[];
    tags?: string[];
    created_at: string;
}

const TASK_TYPES = [
    { value: 'call', label: 'Call', color: 'bg-blue-100 text-blue-800' },
    { value: 'meeting', label: 'Meeting', color: 'bg-purple-100 text-purple-800' },
    { value: 'email', label: 'Email', color: 'bg-green-100 text-green-800' },
    { value: 'follow-up', label: 'Follow-up', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'deadline', label: 'Deadline', color: 'bg-red-100 text-red-800' },
    { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'text-blue-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

const STATUSES = [
    { value: 'to_do', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        task_type: '',
        search: ''
    });

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    const fetchTasks = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.task_type) params.append('task_type', filters.task_type);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/tasks?${params.toString()}`);
            setTasks(response.data.tasks);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const groupedTasks = {
        to_do: tasks.filter(t => t.status === 'to_do'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        completed: tasks.filter(t => t.status === 'completed'),
    };

    const getPriorityColor = (priority: string) => {
        return PRIORITIES.find(p => p.value === priority)?.color || 'text-gray-600';
    };

    const getTaskTypeColor = (type: string) => {
        return TASK_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (date?: string) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (task: Task) => {
        if (!task.due_date || task.status === 'completed') return false;
        return new Date(task.due_date) < new Date();
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading tasks...</div>
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
                        {/* Breadcrumbs removed as requested */}
                        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Organize and track your tasks efficiently
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Task
                    </Button>
                </div>

                {/* Filters and View Toggle */}
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                {STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Priorities</option>
                                {PRIORITIES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                            <select
                                value={filters.task_type}
                                onChange={(e) => setFilters({ ...filters, task_type: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                {TASK_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex border border-gray-300 rounded-lg">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`p-2 ${viewMode === 'kanban' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                            >
                                <Squares2X2Icon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                            >
                                <ListBulletIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Kanban View */}
                {viewMode === 'kanban' && (
                    <div className="grid grid-cols-3 gap-6">
                        {/* To Do Column */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                    To Do ({groupedTasks.to_do.length})
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {groupedTasks.to_do.map(task => (
                                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                                ))}
                                {groupedTasks.to_do.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">No tasks</div>
                                )}
                            </div>
                        </div>

                        {/* In Progress Column */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                    In Progress ({groupedTasks.in_progress.length})
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {groupedTasks.in_progress.map(task => (
                                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                                ))}
                                {groupedTasks.in_progress.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">No tasks</div>
                                )}
                            </div>
                        </div>

                        {/* Completed Column */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                    Completed ({groupedTasks.completed.length})
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {groupedTasks.completed.map(task => (
                                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                                ))}
                                {groupedTasks.completed.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">No tasks</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {tasks.map(task => (
                                        <tr
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className="hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{task.title}</div>
                                                {task.description && (
                                                    <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(task.task_type)}`}>
                                                    {TASK_TYPES.find(t => t.value === task.task_type)?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                                    {PRIORITIES.find(p => p.value === task.priority)?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUSES.find(s => s.value === task.status)?.color}`}>
                                                    {STATUSES.find(s => s.value === task.status)?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {task.due_date ? (
                                                    <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                                                        {formatDate(task.due_date)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {task.assigned_to.name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Task Form Modal */}
            {showCreateModal && (
                <TaskForm
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchTasks();
                        setShowCreateModal(false);
                    }}
                />
            )}

            {/* Task Detail/Edit Modal */}
            {selectedTask && (
                <TaskForm
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSuccess={() => {
                        fetchTasks();
                        setSelectedTask(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
    const getTaskTypeColor = (type: string) => {
        return TASK_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        return PRIORITIES.find(p => p.value === priority)?.color || 'text-gray-600';
    };

    const isOverdue = () => {
        if (!task.due_date || task.status === 'completed') return false;
        return new Date(task.due_date) < new Date();
    };

    return (
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {PRIORITIES.find(p => p.value === task.priority)?.label}
                    </span>
                </div>

                {task.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(task.task_type)}`}>
                        {TASK_TYPES.find(t => t.value === task.task_type)?.label}
                    </span>
                    {task.due_date && (
                        <span className={`text-xs ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                        {task.comments && task.comments.length > 0 && (
                            <div className="flex items-center">
                                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                {task.comments.length}
                            </div>
                        )}
                        {task.estimated_duration && (
                            <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {task.estimated_duration}m
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        {task.assigned_to.name.split(' ')[0]}
                    </div>
                </div>
            </div>
        </Card>
    );
}
