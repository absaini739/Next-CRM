'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function OrganizationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [organization, setOrganization] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            const response = await api.get(`/organizations/${params.id}`);
            setOrganization(response.data);
            setFormData({ name: response.data.name });
        } catch (error) {
            toast.error('Failed to load organization');
            router.push('/organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/organizations/${params.id}`, formData);
            toast.success('Organization updated successfully');
            setEditing(false);
            fetchOrganization();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update organization');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this organization?')) return;

        try {
            await api.delete(`/organizations/${params.id}`);
            toast.success('Organization deleted successfully');
            router.push('/organizations');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete organization');
        }
    };

    if (loading && !organization) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{organization?.name}</h1>
                        <p className="mt-1 text-sm text-gray-600">Organization Details</p>
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
                                label="Organization Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
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
                        <Card title="Organization Information">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{organization?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(organization?.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        <Card title="Associated Contacts">
                            <div className="text-sm text-gray-600">
                                <p>Contacts linked to this organization will appear here.</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
