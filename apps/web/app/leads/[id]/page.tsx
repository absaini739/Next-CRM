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
        first_name: '',
        last_name: '',
        company_name: '',
        job_title: '',
        website: '',
        linkedin_url: '',
        location: '',
        primary_email: '',
        secondary_email: '',
        phone: '',
        mobile: '',
        lead_rating: 'Medium',
        no_employees: '',
        lead_value: '',
        status: null as number | null,
        person_id: '',
    });

    useEffect(() => {
        fetchLead();
        fetchPersons();
    }, []);

    const fetchLead = async () => {
        try {
            const response = await api.get(`/leads/${params.id}`);
            const data = response.data;
            setLead(data);
            setFormData({
                title: data.title,
                description: data.description || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                company_name: data.company_name || '',
                job_title: data.job_title || '',
                website: data.website || '',
                linkedin_url: data.linkedin_url || '',
                location: data.location || '',
                primary_email: data.primary_email || '',
                secondary_email: data.secondary_email || '',
                phone: data.phone || '',
                mobile: data.mobile || '',
                lead_rating: data.lead_rating || 'Medium',
                no_employees: data.no_employees || '',
                lead_value: data.lead_value || '',
                status: data.status,
                person_id: data.person_id?.toString() || '',
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
                person_id: formData.person_id ? parseInt(formData.person_id) : undefined,
                lead_value: formData.lead_value ? parseFloat(formData.lead_value) : undefined,
                lead_source_id: 1,
                lead_type_id: 1,
            };

            await api.put(`/leads/${params.id}`, payload);
            toast.success('Lead updated successfully');
            if (formData.status === 1) {
                toast.success('Lead converted to Deal!');
            }
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
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading...</div>
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
            <div className="max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{lead?.title}</h1>
                            {getStatusBadge()}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Lead Details</p>
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
                        <form onSubmit={handleUpdate} className="space-y-6 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Input
                                    label="Lead Title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <Input
                                    label="First Name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                                <Input
                                    label="Company Name"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                                <Input
                                    label="Job Title"
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                />
                                <Input
                                    label="Website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                />
                                <Input
                                    label="Primary Email"
                                    value={formData.primary_email}
                                    onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                                />
                                <Input
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Select
                                    label="Status"
                                    value={formData.status?.toString() || ''}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value ? parseInt(e.target.value) : null })}
                                    options={[
                                        { value: '', label: 'Open' },
                                        { value: '1', label: 'Won' },
                                        { value: '0', label: 'Lost' },
                                    ]}
                                />
                                <Input
                                    label="Lead Value"
                                    type="number"
                                    step="0.01"
                                    value={formData.lead_value}
                                    onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
                                />
                                <Select
                                    label="Link to Person"
                                    value={formData.person_id}
                                    onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                    options={[
                                        { value: '', label: 'None' },
                                        ...persons.map((p: any) => ({ value: p.id, label: p.name })),
                                    ]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card title="Lead Information">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">First Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{lead?.first_name || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Last Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{lead?.last_name || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Company</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{lead?.company_name || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Job Title</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{lead?.job_title || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{lead?.primary_email || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Phone</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{lead?.phone || 'N/A'}</dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Description</dt>
                                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{lead?.description || 'No description provided.'}</dd>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Activity Timeline">
                                <div className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                                    <p>Activities related to this lead will appear here.</p>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card title="Sales Info">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Lead Value</dt>
                                        <dd className="mt-1 text-lg font-bold text-blue-600">
                                            {lead?.lead_value ? `$${parseFloat(lead.lead_value).toLocaleString()}` : '$0.00'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Created</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(lead?.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    {lead?.deals && lead.deals.length > 0 && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <dt className="text-sm font-medium text-green-600">Converted Deal</dt>
                                            <dd className="mt-1">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => router.push(`/deals/${lead.deals[0].id}`)}
                                                    className="w-full text-xs"
                                                >
                                                    View Deal
                                                </Button>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
