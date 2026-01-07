'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function DealDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [deal, setDeal] = useState<any>(null);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deal_value: '',
        person_id: '',
        expected_close_date: '',
    });

    useEffect(() => {
        fetchDeal();
        fetchPersons();
    }, []);

    const fetchDeal = async () => {
        try {
            const response = await api.get(`/deals/${params.id}`);
            setDeal(response.data);
            setFormData({
                title: response.data.title,
                description: response.data.description || '',
                deal_value: response.data.deal_value || '',
                person_id: response.data.person_id?.toString() || '',
                expected_close_date: response.data.expected_close_date || '',
            });
        } catch (error) {
            toast.error('Failed to load deal');
            router.push('/deals');
        } finally {
            setLoading(false);
        }
    };

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error('Failed to load persons');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                person_id: parseInt(formData.person_id),
                deal_value: parseFloat(formData.deal_value),
                expected_close_date: formData.expected_close_date || undefined,
            };

            await api.put(`/deals/${params.id}`, payload);
            toast.success('Deal updated successfully');
            setEditing(false);
            fetchDeal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update deal');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this deal?')) return;

        try {
            await api.delete(`/deals/${params.id}`);
            toast.success('Deal deleted successfully');
            router.push('/deals');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete deal');
        }
    };

    if (loading && !deal) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    const getStatusBadge = () => {
        if (deal?.status === 'won') return <Badge variant="success">Won</Badge>;
        if (deal?.status === 'lost') return <Badge variant="danger">Lost</Badge>;
        return <Badge variant="info">Open</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{deal?.title}</h1>
                            {getStatusBadge()}
                        </div>
                        <p className="mt-1 text-lg font-semibold text-blue-600">
                            ${parseFloat(deal?.deal_value || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant={editing ? 'secondary' : 'primary'}
                            onClick={() => setEditing(!editing)}
                            className="flex items-center"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            className="flex items-center"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {editing ? (
                    <Card>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <Input
                                label="Deal Title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <Input
                                label="Deal Value"
                                type="number"
                                step="0.01"
                                required
                                value={formData.deal_value}
                                onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                            />
                            <Select
                                label="Contact Person"
                                required
                                value={formData.person_id}
                                onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                options={[
                                    { value: '', label: 'Select a person...' },
                                    ...persons.map((p: any) => ({ value: p.id, label: p.name })),
                                ]}
                            />
                            <Input
                                label="Expected Close Date"
                                type="date"
                                value={formData.expected_close_date}
                                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Deal Information">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Title</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{deal?.title}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{deal?.description || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Value</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        ${parseFloat(deal?.deal_value || 0).toLocaleString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Expected Close Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {deal?.expected_close_date
                                            ? new Date(deal.expected_close_date).toLocaleDateString()
                                            : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(deal?.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        <Card title="Activity Timeline">
                            <div className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                                <p>Activities and notes related to this deal will appear here.</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
