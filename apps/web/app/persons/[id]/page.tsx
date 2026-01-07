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

export default function PersonDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [person, setPerson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        mobile: '',
    });

    useEffect(() => {
        fetchPerson();
    }, []);

    const fetchPerson = async () => {
        try {
            const response = await api.get(`/persons/${params.id}`);
            setPerson(response.data);

            // Pre-fill form data
            const primaryEmail = response.data.emails?.find((e: any) => e.label === 'primary')?.value || '';
            const phoneNumber = response.data.contact_numbers?.find((n: any) => n.label === 'phone')?.value || '';
            const mobileNumber = response.data.contact_numbers?.find((n: any) => n.label === 'mobile')?.value || '';

            setFormData({
                name: response.data.name,
                email: primaryEmail,
                phone: phoneNumber,
                mobile: mobileNumber,
            });
        } catch (error) {
            toast.error('Failed to load person');
            router.push('/persons');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                emails: formData.email ? [{ value: formData.email, label: 'primary' }] : [],
                contact_numbers: [
                    ...(formData.phone ? [{ value: formData.phone, label: 'phone' }] : []),
                    ...(formData.mobile ? [{ value: formData.mobile, label: 'mobile' }] : []),
                ],
            };

            await api.put(`/persons/${params.id}`, payload);
            toast.success('Person updated successfully');
            setEditing(false);
            fetchPerson();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update person');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this person?')) return;

        try {
            await api.delete(`/persons/${params.id}`);
            toast.success('Person deleted successfully');
            router.push('/persons');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete person');
        }
    };

    if (loading && !person) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{person?.name}</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Contact Details</p>
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
                                label="Full Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Input
                                label="Mobile Number"
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
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
                        <Card title="Contact Information">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{person?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {person?.emails?.find((e: any) => e.label === 'primary')?.value || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Phone</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {person?.contact_numbers?.find((n: any) => n.label === 'phone')?.value || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Mobile</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {person?.contact_numbers?.find((n: any) => n.label === 'mobile')?.value || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-500">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(person?.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        <Card title="Related Records">
                            <div className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                                <p>Related leads, deals, and activities will appear here.</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
