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

export default function NewDealPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [persons, setPersons] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deal_value: '',
        person_id: '',
        expected_close_date: '',
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
                person_id: parseInt(formData.person_id),
                deal_value: parseFloat(formData.deal_value),
                expected_close_date: formData.expected_close_date || undefined,
            };

            await api.post('/deals', payload);
            toast.success('Deal created successfully');
            router.push('/deals');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create deal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Add New Deal</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Create a new sales deal
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Deal Title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enterprise License - $100K"
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
                            />
                        </div>

                        <Input
                            label="Deal Value"
                            type="number"
                            step="0.01"
                            required
                            value={formData.deal_value}
                            onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                            placeholder="100000"
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

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button type="button" variant="secondary" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Deal'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
