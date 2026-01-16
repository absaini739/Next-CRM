'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    ChevronLeftIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    FlagIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const STATUSES = [
    { value: 'to_do', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const TaskSummary = ({ summary, loading }: { summary: any[], loading: boolean }) => {
    const completionRate = summary.length > 0
        ? Math.round(summary.reduce((acc, t) => acc + (t.status === 'completed' ? 100 : Number(t.progress || 0)), 0) / summary.length)
        : 0;

    return (
        <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                Today's Overview ({summary.length})
                <span className="text-blue-600 dark:text-blue-400">{completionRate}%</span>
            </h3>

            <div className="w-full bg-gray-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-blue-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${completionRate}%` }}
                />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {loading ? (
                    <div className="text-xs text-gray-400 animate-pulse">Loading summary...</div>
                ) : summary.length === 0 ? (
                    <div className="text-xs text-gray-400 italic">No tasks due today</div>
                ) : (
                    summary.map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs">
                            <div className={`h-1.5 w-1.5 rounded-full ${t.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                            <span className={`flex-1 truncate ${t.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-slate-300 font-medium'}`}>
                                {t.title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold ">{t.status === 'completed' ? '100%' : `${t.progress || 0}%`}</span>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const taskId = params.id as string;

    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [newComment, setNewComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);
    const [summary, setSummary] = useState<any[]>([]);
    const [summaryLoading, setSummaryLoading] = useState(true);

    useEffect(() => {
        fetchTask();
        fetchTodaySummary();
        const interval = setInterval(fetchTodaySummary, 10000);
        return () => clearInterval(interval);
    }, [taskId]);

    const fetchTodaySummary = async () => {
        try {
            const response = await api.get('/tasks/today');
            setSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch summary');
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchTask = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tasks/${taskId}`);
            setTask(response.data);
            setFormData({
                title: response.data.title,
                description: response.data.description || '',
                priority: response.data.priority,
                status: response.data.status,
                progress: response.data.progress || 0,
                due_date: response.data.due_date ? new Date(response.data.due_date).toISOString().split('T')[0] : '',
                due_time: response.data.due_time || '',
            });
        } catch (error) {
            toast.error('Failed to load task');
            router.push('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = currentUser?.role?.name === 'Administrator' || currentUser?.role?.name === 'Admin' || (currentUser?.role as any)?.permission_type === 'all';
    const isAssigner = task?.assigned_by_id === currentUser?.id;
    const permissions = currentUser?.role?.permissions as any;
    const hasAssignPermission = permissions?.tasks?.includes('assign') || permissions?.tasks?.includes('manage_all');

    const canEditCore = isAdmin || isAssigner || hasAssignPermission;

    const handleUpdate = async (updateData: any) => {
        try {
            setSaving(true);
            const response = await api.put(`/tasks/${taskId}`, updateData);
            setTask(response.data);
            // Refresh summary if status or progress changed
            if (updateData.status || updateData.progress !== undefined) {
                fetchTodaySummary();
            }
            // Sync formData from server response to ensure proper formatting
            setFormData({
                title: response.data.title,
                description: response.data.description || '',
                priority: response.data.priority,
                status: response.data.status,
                progress: response.data.progress || 0,
                due_date: response.data.due_date ? new Date(response.data.due_date).toISOString().split('T')[0] : '',
                due_time: response.data.due_time || '',
            });
            toast.success('Task updated successfully');
        } catch (error) {
            toast.error('Failed to update task');
        } finally {
            setSaving(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            setAddingComment(true);
            await api.post(`/tasks/${taskId}/comments`, { content: newComment });
            setNewComment('');
            // Refresh task to get updated comments
            await fetchTask();
            toast.success('Work note added successfully');
        } catch (error) {
            toast.error('Failed to add work note');
        } finally {
            setAddingComment(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!task) return null;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back to Tasks
                    </button>
                    <div className="flex gap-2">
                        {task.status !== 'completed' && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdate({ status: 'completed', progress: 100 })}
                                disabled={saving}
                            >
                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                Mark Completed
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-8 border-none shadow-sm bg-white dark:bg-slate-800/50">
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                            <span>Task ID: #{task.id}</span>
                                            <span className="h-1 w-1 rounded-full bg-blue-600" />
                                            <span>{task.task_type}</span>
                                        </div>
                                        {canEditCore ? (
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                onBlur={() => handleUpdate({ title: formData.title })}
                                                className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight bg-transparent border-b-2 border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none w-full transition-all"
                                            />
                                        ) : (
                                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                                {task.title}
                                            </h1>
                                        )}
                                        <div className="flex items-center gap-2 pt-1">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'high' || task.priority === 'urgent'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {task.priority} Priority
                                            </div>
                                            <span className="text-xs text-gray-400">|</span>
                                            <p className="text-xs text-gray-500 dark:text-slate-500">
                                                Added by <span className="font-semibold text-gray-700 dark:text-slate-300">{task.assigned_by.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                        <CalendarIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-800/50 pt-6">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                        Task Description
                                    </h3>
                                    <div className="text-gray-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100/50 dark:border-slate-800/50">
                                        {canEditCore ? (
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                onBlur={() => handleUpdate({ description: formData.description })}
                                                rows={4}
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-700 dark:text-slate-300 resize-none"
                                                placeholder="Enter task description..."
                                            />
                                        ) : (
                                            task.description || (
                                                <span className="italic text-gray-400">No additional details provided.</span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Progress Section */}
                        <Card className="p-8 border-none shadow-sm overflow-hidden relative bg-white dark:bg-slate-800">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                <ArrowPathIcon className="h-4 w-4 text-blue-500" />
                                Execution Progress
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex-1 relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={formData.progress}
                                            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                            onMouseUp={() => handleUpdate({ progress: formData.progress })}
                                            className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none min-w-[70px]">
                                        <span className="text-xl font-black">{formData.progress}%</span>
                                        <span className="text-[10px] font-bold uppercase mt-1 opacity-80">Progress</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-[9px] text-gray-400 font-bold uppercase text-center">
                                    <div className={formData.progress < 25 ? 'text-blue-600' : ''}>Planning</div>
                                    <div className={formData.progress >= 25 && formData.progress < 75 ? 'text-blue-600' : ''}>Active Work</div>
                                    <div className={formData.progress >= 75 && formData.progress < 100 ? 'text-blue-600' : ''}>Testing</div>
                                    <div className={formData.progress === 100 ? 'text-green-600' : ''}>Review</div>
                                </div>
                            </div>
                        </Card>                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-6">
                        <TaskSummary summary={summary} loading={summaryLoading} />

                        <Card className="p-6 space-y-6 border-none shadow-sm bg-white dark:bg-slate-800">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-3">Lifecycle Control</h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleUpdate({ status: e.target.value })}
                                        className="w-full text-sm bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-xl"
                                    >
                                        {STATUSES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-tight flex items-center justify-between">
                                        Work Priority
                                        {!canEditCore && <span className="text-[10px] text-gray-400 normal-case font-normal">(Read Only)</span>}
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => handleUpdate({ priority: e.target.value })}
                                        disabled={!canEditCore || saving}
                                        className={`w-full text-sm bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all ${!canEditCore ? 'cursor-not-allowed opacity-75' : ''}`}
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tight flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                Deadline
                                            </div>
                                            {!canEditCore && <span className="text-[10px] text-gray-400 normal-case font-normal">(Read Only)</span>}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={formData.due_date}
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    setFormData({ ...formData, due_date: newDate });
                                                    handleUpdate({ due_date: newDate });
                                                }}
                                                disabled={!canEditCore || saving}
                                                className={`flex-1 text-sm bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all p-2 ${!canEditCore ? 'cursor-not-allowed opacity-75' : ''}`}
                                            />
                                            <input
                                                type="time"
                                                value={formData.due_time}
                                                onChange={(e) => {
                                                    const newTime = e.target.value;
                                                    setFormData({ ...formData, due_time: newTime });
                                                    handleUpdate({ due_time: newTime });
                                                }}
                                                disabled={!canEditCore || saving}
                                                className={`w-32 text-sm bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all p-2 ${!canEditCore ? 'cursor-not-allowed opacity-75' : ''}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs px-1">
                                        <div className="flex items-center text-gray-400 uppercase font-bold tracking-tighter">
                                            <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                                            <span>Assignee</span>
                                        </div>
                                        <span className="font-bold text-gray-700 dark:text-slate-300">{task.assigned_to.name}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {(task.person || task.lead || task.deal) && (
                            <Card className="p-6 space-y-4 border-none shadow-sm bg-white dark:bg-slate-800/30">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-3">Contextual Link</h3>
                                <div className="space-y-3">
                                    {task.person && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                                            <UserIcon className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-semibold">{task.person.name}</span>
                                        </div>
                                    )}
                                    {task.deal && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                                            <TagIcon className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-semibold">{task.deal.title}</span>
                                        </div>
                                    )}
                                    {task.lead && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                                            <FlagIcon className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm font-semibold">{task.lead.title}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
