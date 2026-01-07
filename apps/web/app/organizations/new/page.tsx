'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function NewOrganizationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/organizations', formData);
            toast.success('Organization created successfully');
            router.push('/organizations');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Add New Organization</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Create a new company account
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Organization Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Acme Corporation"
                        />

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Organization'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
