'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function NewLeadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [persons, setPersons] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lead_value: '',
        person_id: '',
        lead_source_id: '1',
        lead_type_id: '1',
    });

    useEffect(() => {
        fetchPersons();
    }, []);

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error('Failed to load persons');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                lead_source_id: parseInt(formData.lead_source_id),
                lead_type_id: parseInt(formData.lead_type_id),
                person_id: parseInt(formData.person_id),
                lead_value: formData.lead_value ? parseFloat(formData.lead_value) : undefined,
            };

            await api.post('/leads', payload);
            toast.success('Lead created successfully');
            router.push('/leads');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Create a new sales opportunity
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Lead Title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enterprise Deal - Acme Corp"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Describe the lead opportunity..."
                            />
                        </div>

                        <Input
                            label="Lead Value"
                            type="number"
                            step="0.01"
                            value={formData.lead_value}
                            onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
                            placeholder="50000"
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

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Lead'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
