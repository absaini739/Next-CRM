import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface TaskFormProps {
    task?: any;
    selectedDate?: Date;
    onClose: () => void;
    onSuccess: () => void;
}

const TASK_TYPES = [
    { value: 'call', label: 'Call' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'email', label: 'Email' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'custom', label: 'Custom' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export default function TaskForm({ task, selectedDate, onClose, onSuccess }: TaskFormProps) {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [persons, setPersons] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        task_type: task?.task_type || 'call',
        priority: task?.priority || 'medium',
        status: task?.status || 'to_do',
        due_date: task?.due_date
            ? task.due_date.split('T')[0]
            : selectedDate
                ? selectedDate.toISOString().split('T')[0]
                : '',
        due_time: task?.due_time || '',
        estimated_duration: task?.estimated_duration || '',
        assigned_to_id: task?.assigned_to_id || '',
        person_id: task?.person_id || '',
        organization_id: task?.organization_id || '',
        lead_id: task?.lead_id || '',
        deal_id: task?.deal_id || '',
        tags: Array.isArray(task?.tags) ? task.tags.join(', ') : '',
        progress: task?.progress || 0,
    });

    useEffect(() => {
        fetchUsers();
        fetchPersons();
        fetchOrganizations();
        fetchLeads();
        fetchDeals();
    }, []);

    const isAssigner = task?.assigned_by_id === currentUser?.id;
    const userRole = currentUser?.role?.name || 'new';
    const isAdmin = userRole === 'Administrator';
    const isManager = userRole === 'Manager';
    const isLead = userRole === 'Lead';
    const isEmployee = userRole === 'Employee';

    // Only Admin, Manager, and Lead can assign/create tasks for others
    const canCreateOrAssign = isAdmin || isManager || isLead;

    // canEditCore remains for general editing of task details
    const canEditCore = canCreateOrAssign || isAssigner;

    const fetchUsers = async () => {
        try {
            // Updated to fetch users with roles and hierarchy info
            const response = await api.get('/auth/users');
            const allUsers = response.data;

            if (canEditCore) {
                setUsers(allUsers);
            } else {
                // Only self-assignment if no permission
                setUsers(allUsers.filter((u: any) => u.id === currentUser?.id));
                if (!formData.assigned_to_id) {
                    setFormData(prev => ({ ...prev, assigned_to_id: currentUser?.id.toString() }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error('Failed to fetch persons');
        }
    };

    const fetchOrganizations = async () => {
        try {
            const response = await api.get('/organizations');
            setOrganizations(response.data);
        } catch (error) {
            console.error('Failed to fetch organizations');
        }
    };

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
        } catch (error) {
            console.error('Failed to fetch leads');
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await api.get('/deals');
            setDeals(response.data);
        } catch (error) {
            console.error('Failed to fetch deals');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : undefined,
                estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
                person_id: formData.person_id ? parseInt(formData.person_id) : undefined,
                organization_id: formData.organization_id ? parseInt(formData.organization_id) : undefined,
                lead_id: formData.lead_id ? parseInt(formData.lead_id) : undefined,
                deal_id: formData.deal_id ? parseInt(formData.deal_id) : undefined,
                tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            };

            if (task) {
                await api.put(`/tasks/${task.id}`, payload);
                toast.success('Task updated successfully');
            } else {
                await api.post('/tasks', payload);
                toast.success('Task created successfully');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title - Deal Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Deal * {!canEditCore && task && <span className="text-xs font-normal text-gray-400">(Read Only)</span>}
                        </label>
                        <select
                            required
                            value={formData.deal_id}
                            onChange={(e) => {
                                const selectedDeal = deals.find(d => d.id === parseInt(e.target.value));
                                setFormData({
                                    ...formData,
                                    deal_id: e.target.value,
                                    title: selectedDeal ? selectedDeal.title : formData.title
                                });
                            }}
                            disabled={!canEditCore && !!task}
                            className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                            <option value="">Select Deal</option>
                            {deals.map(d => (
                                <option key={d.id} value={d.id}>{d.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description {!canEditCore && task && <span className="text-xs font-normal text-gray-400">(Read Only)</span>}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            disabled={!canEditCore && !!task}
                            className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                            placeholder="Enter task description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Task Type *
                            </label>
                            <select
                                required
                                value={formData.task_type}
                                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                                disabled={!canEditCore && !!task}
                                className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                            >
                                {TASK_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Priority *
                            </label>
                            <select
                                required
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                disabled={!canEditCore && !!task}
                                className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                            >
                                {PRIORITIES.map(priority => (
                                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                disabled={!canEditCore && !!task}
                                className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Time
                            </label>
                            <input
                                type="time"
                                value={formData.due_time}
                                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                                disabled={!canEditCore && !!task}
                                className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Assigned To and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Assign To *
                            </label>
                            <select
                                required
                                value={formData.assigned_to_id}
                                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                disabled={!canEditCore && !!task}
                                className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${!canEditCore && !!task ? 'cursor-not-allowed opacity-75' : ''}`}
                            >
                                <option value="">Select user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Progress ({formData.progress}%)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={formData.progress}
                                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-10">{formData.progress}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Status (only for edit) */}
                    {task && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            >
                                <option value="to_do">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="Enter tags separated by commas"
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Separate multiple tags with commas</p>
                    </div>


                    {/* Actions */}
                    <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200 dark:border-slate-700">
                        {isEmployee && !task && (
                            <p className="text-xs text-red-500 font-medium text-center">
                                Employees are not authorized to create or assign tasks.
                            </p>
                        )}
                        {!canCreateOrAssign && task && (
                            <p className="text-xs text-amber-500 font-medium text-center">
                                You only have permission to update your current tasks, not reassign them.
                            </p>
                        )}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading || (isEmployee && !task)}
                            >
                                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
