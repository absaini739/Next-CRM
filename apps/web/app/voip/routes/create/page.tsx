'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateInboundRoutePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [trunks, setTrunks] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        did_pattern: '',
        destination_type: 'user',
        destination_id: '',
        trunk_id: '',
        priority: 1,
        active: true,
    });

    useEffect(() => {
        fetchTrunks();
    }, []);

    const fetchTrunks = async () => {
        try {
            const response = await api.get('/voip/trunks');
            setTrunks(response.data);
        } catch (error) {
            toast.error('Failed to load trunks');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/voip/routes', formData);
            toast.success('Inbound route created successfully');
            router.push('/voip/routes');
        } catch (error) {
            toast.error('Failed to create inbound route');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.back()}
                        className="flex items-center"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Create Inbound Route</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Define how incoming calls should be routed
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Route Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter route name"
                                    required
                                />

                                <Input
                                    label="DID Pattern"
                                    name="did_pattern"
                                    value={formData.did_pattern}
                                    onChange={handleChange}
                                    placeholder="+15551234567 or 555*"
                                    required
                                />

                                <Select
                                    label="Destination Type"
                                    name="destination_type"
                                    value={formData.destination_type}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'user', label: 'User' },
                                        { value: 'queue', label: 'Queue' },
                                        { value: 'ivr', label: 'IVR' },
                                        { value: 'voicemail', label: 'Voicemail' },
                                    ]}
                                    required
                                />

                                <Input
                                    label="Destination ID"
                                    name="destination_id"
                                    value={formData.destination_id}
                                    onChange={handleChange}
                                    placeholder="User ID, Queue ID, etc."
                                    required
                                />

                                <Select
                                    label="Trunk"
                                    name="trunk_id"
                                    value={formData.trunk_id}
                                    onChange={handleChange}
                                    options={[
                                        { value: '', label: 'Select a trunk...' },
                                        ...trunks.map(t => ({ value: t.id.toString(), label: t.name }))
                                    ]}
                                    required
                                />

                                <Input
                                    label="Priority"
                                    name="priority"
                                    type="number"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    placeholder="1"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Route'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
}
