import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface TaskFormProps {
    task?: any;
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

export default function TaskForm({ task, onClose, onSuccess }: TaskFormProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        task_type: task?.task_type || 'call',
        priority: task?.priority || 'medium',
        status: task?.status || 'to_do',
        due_date: task?.due_date ? task.due_date.split('T')[0] : '',
        due_time: task?.due_time || '',
        estimated_duration: task?.estimated_duration || '',
        assigned_to_id: task?.assigned_to_id || '',
        person_id: task?.person_id || '',
        organization_id: task?.organization_id || '',
        lead_id: task?.lead_id || '',
        deal_id: task?.deal_id || '',
        tags: task?.tags?.join(', ') || '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                assigned_to_id: parseInt(formData.assigned_to_id),
                estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
                person_id: formData.person_id ? parseInt(formData.person_id) : undefined,
                organization_id: formData.organization_id ? parseInt(formData.organization_id) : undefined,
                lead_id: formData.lead_id ? parseInt(formData.lead_id) : undefined,
                deal_id: formData.deal_id ? parseInt(formData.deal_id) : undefined,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter task description"
                        />
                    </div>

                    {/* Task Type and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Task Type *
                            </label>
                            <select
                                required
                                value={formData.task_type}
                                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {TASK_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority *
                            </label>
                            <select
                                required
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {PRIORITIES.map(priority => (
                                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Due Date and Time */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time
                            </label>
                            <input
                                type="time"
                                value={formData.due_time}
                                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Assigned To and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign To *
                            </label>
                            <select
                                required
                                value={formData.assigned_to_id}
                                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={formData.estimated_duration}
                                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 60"
                            />
                        </div>
                    </div>

                    {/* Status (only for edit) */}
                    {task && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter tags separated by commas"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                    </div>

                    {/* CRM Relations (Optional) */}
                    <div className="border-t pt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Link to CRM Entity (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Person ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.person_id}
                                    onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Person ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Organization ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.organization_id}
                                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Organization ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lead ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.lead_id}
                                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lead ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deal ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.deal_id}
                                    onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Deal ID"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
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
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
