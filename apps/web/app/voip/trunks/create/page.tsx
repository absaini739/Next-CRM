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

export default function CreateVoIPTrunkPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        provider_id: '',
        sip_domain: '',
        sip_port: 5060,
        transport_protocol: 'UDP',
        auth_method: 'username',
        sip_username: '',
        sip_password: '',
        registration_required: false,
        options_context: '',
        active: true,
    });

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const response = await api.get('/voip/providers');
            setProviders(response.data);
        } catch (error) {
            toast.error('Failed to load providers');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/voip/trunks', formData);
            toast.success('VoIP trunk created successfully');
            router.push('/voip/trunks');
        } catch (error) {
            toast.error('Failed to create VoIP trunk');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Create VoIP Trunk</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Configure a new SIP trunk connection
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Trunk Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="My SIP Trunk"
                                    required
                                />

                                <Select
                                    label="Provider"
                                    name="provider_id"
                                    value={formData.provider_id}
                                    onChange={handleChange}
                                    options={[
                                        { value: '', label: 'Select a provider...' },
                                        ...providers.map(p => ({ value: p.id.toString(), label: p.name }))
                                    ]}
                                    required
                                />

                                <Input
                                    label="SIP Domain / Host"
                                    name="sip_domain"
                                    value={formData.sip_domain}
                                    onChange={handleChange}
                                    placeholder="sip.twilio.com"
                                    required
                                />

                                <Input
                                    label="SIP Port"
                                    name="sip_port"
                                    type="number"
                                    value={formData.sip_port}
                                    onChange={handleChange}
                                    placeholder="5060"
                                    required
                                />

                                <Select
                                    label="Transport Protocol"
                                    name="transport_protocol"
                                    value={formData.transport_protocol}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'UDP', label: 'UDP' },
                                        { value: 'TCP', label: 'TCP' },
                                        { value: 'TLS', label: 'TLS' },
                                    ]}
                                    required
                                />

                                <Select
                                    label="Authentication Method"
                                    name="auth_method"
                                    value={formData.auth_method}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'username', label: 'Username/Password' },
                                        { value: 'ip', label: 'IP Based' },
                                    ]}
                                    required
                                />
                            </div>

                            {formData.auth_method === 'username' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                                    <Input
                                        label="SIP Username"
                                        name="sip_username"
                                        value={formData.sip_username}
                                        onChange={handleChange}
                                        placeholder="username"
                                    />

                                    <Input
                                        label="SIP Password"
                                        name="sip_password"
                                        type="password"
                                        value={formData.sip_password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            <div className="border-t pt-6">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="registration_required"
                                        checked={formData.registration_required}
                                        onChange={handleChange}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Registration Required</span>
                                </label>
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
                                    {loading ? 'Creating...' : 'Create Trunk'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
}
