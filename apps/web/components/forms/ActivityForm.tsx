import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ActivityFormProps {
    activity?: any;
    onClose: () => void;
    onSuccess: () => void;
}

const ACTIVITY_TYPES = [
    { value: 'call', label: 'Call' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'task', label: 'Task' },
    { value: 'note', label: 'Note' },
    { value: 'email', label: 'Email' },
];

export default function ActivityForm({ activity, onClose, onSuccess }: ActivityFormProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [persons, setPersons] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [deals, setDeals] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: activity?.title || '',
        description: activity?.description || '',
        type: activity?.type || 'call',
        start_at: activity?.start_at ? new Date(activity.start_at).toISOString().slice(0, 16) : '',
        end_at: activity?.end_at ? new Date(activity.end_at).toISOString().slice(0, 16) : '',
        completed: activity?.completed || false,
        person_id: activity?.person_id || '',
        lead_id: activity?.lead_id || '',
        deal_id: activity?.deal_id || '',
    });

    useEffect(() => {
        fetchUsers();
        fetchPersons();
        fetchLeads();
        fetchDeals();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error('Failed to fetch persons:', error);
        }
    };

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await api.get('/deals');
            setDeals(response.data);
        } catch (error) {
            console.error('Failed to fetch deals:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                person_id: formData.person_id ? parseInt(formData.person_id) : undefined,
                lead_id: formData.lead_id ? parseInt(formData.lead_id) : undefined,
                deal_id: formData.deal_id ? parseInt(formData.deal_id) : undefined,
                start_at: formData.start_at ? new Date(formData.start_at).toISOString() : undefined,
                end_at: formData.end_at ? new Date(formData.end_at).toISOString() : undefined,
            };

            if (activity) {
                await api.put(`/activities/${activity.id}`, payload);
                toast.success('Activity updated successfully');
            } else {
                await api.post('/activities', payload);
                toast.success('Activity created successfully');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save activity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {activity ? 'Edit Activity' : 'Create New Activity'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="Enter activity title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="Enter activity description"
                        />
                    </div>

                    {/* Activity Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Activity Type *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            >
                                {ACTIVITY_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 pt-8">
                            <input
                                type="checkbox"
                                id="completed"
                                checked={formData.completed}
                                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="completed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mark as Completed
                            </label>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start At
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.start_at}
                                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End At
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.end_at}
                                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* CRM Relations */}
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Link to CRM Entity (Optional)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Person
                                </label>
                                <select
                                    value={formData.person_id}
                                    onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Person</option>
                                    {persons.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lead
                                </label>
                                <select
                                    value={formData.lead_id}
                                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Lead</option>
                                    {leads.map(l => (
                                        <option key={l.id} value={l.id}>{l.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Deal
                                </label>
                                <select
                                    value={formData.deal_id}
                                    onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Deal</option>
                                    {deals.map(d => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700">
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
                            {loading ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
