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

export default function LeadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [lead, setLead] = useState<any>(null);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lead_value: '',
        person_id: '',
    });

    useEffect(() => {
        fetchLead();
        fetchPersons();
    }, []);

    const fetchLead = async () => {
        try {
            const response = await api.get(`/leads/${params.id}`);
            setLead(response.data);
            setFormData({
                title: response.data.title,
                description: response.data.description || '',
                lead_value: response.data.lead_value || '',
                person_id: response.data.person_id?.toString() || '',
            });
        } catch (error) {
            toast.error('Failed to load lead');
            router.push('/leads');
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
                lead_value: formData.lead_value ? parseFloat(formData.lead_value) : undefined,
                lead_source_id: 1,
                lead_type_id: 1,
            };

            await api.put(`/leads/${params.id}`, payload);
            toast.success('Lead updated successfully');
            setEditing(false);
            fetchLead();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update lead');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            await api.delete(`/leads/${params.id}`);
            toast.success('Lead deleted successfully');
            router.push('/leads');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete lead');
        }
    };

    if (loading && !lead) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    const getStatusBadge = () => {
        if (lead?.status === 1) return <Badge variant="success">Won</Badge>;
        if (lead?.status === 0) return <Badge variant="danger">Lost</Badge>;
        return <Badge variant="info">Open</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900">{lead?.title}</h1>
                            {getStatusBadge()}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">Lead Details</p>
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
                                label="Lead Title"
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
                                label="Lead Value"
                                type="number"
                                step="0.01"
                                value={formData.lead_value}
                                onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
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
                            <div className="flex justify-end">
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Lead Information">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{lead?.title}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{lead?.description || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Value</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {lead?.lead_value ? `$${parseFloat(lead.lead_value).toLocaleString()}` : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(lead?.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        <Card title="Activity Timeline">
                            <div className="text-sm text-gray-600">
                                <p>Activities related to this lead will appear here.</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
