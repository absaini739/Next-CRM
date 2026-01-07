'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateVoIPProviderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        provider_type: 'twilio',
        // Twilio fields
        account_sid: '',
        auth_token: '',
        api_key_sid: '',
        api_key_secret: '',
        twiml_app_sid: '',
        // Telnyx fields
        api_key: '',
        connection_id: '',
        webhook_secret: '',
        // SIP fields
        sip_server: '',
        sip_port: 5060,
        sip_username: '',
        sip_password: '',
        transport: 'UDP',
        // Common
        from_number: '',
        active: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/voip/providers', formData);
            toast.success('VoIP provider created successfully');
            router.push('/voip/providers');
        } catch (error) {
            toast.error('Failed to create VoIP provider');
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
                        <h1 className="text-2xl font-bold text-gray-900">Create VoIP Provider</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Add a new VoIP service provider to your CRM
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="space-y-6">
                            {/* Common Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Provider Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Twilio Production"
                                    required
                                />

                                <Select
                                    label="Provider Type"
                                    name="provider_type"
                                    value={formData.provider_type}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'twilio', label: 'Twilio' },
                                        { value: 'telnyx', label: 'Telnyx' },
                                        { value: 'sip', label: 'Generic SIP' },
                                    ]}
                                    required
                                />
                            </div>

                            {/* Twilio-specific fields */}
                            {formData.provider_type === 'twilio' && (
                                <>
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Twilio Configuration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Account SID"
                                                name="account_sid"
                                                value={formData.account_sid}
                                                onChange={handleChange}
                                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                required
                                            />
                                            <Input
                                                label="Auth Token"
                                                name="auth_token"
                                                type="password"
                                                value={formData.auth_token}
                                                onChange={handleChange}
                                                placeholder="••••••••••••••••••••••••••••••••"
                                                required
                                            />
                                            <Input
                                                label="API Key SID (Optional)"
                                                name="api_key_sid"
                                                value={formData.api_key_sid}
                                                onChange={handleChange}
                                                placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            />
                                            <Input
                                                label="API Key Secret (Optional)"
                                                name="api_key_secret"
                                                type="password"
                                                value={formData.api_key_secret}
                                                onChange={handleChange}
                                                placeholder="••••••••••••••••••••••••••••••••"
                                            />
                                            <Input
                                                label="TwiML App SID (Optional)"
                                                name="twiml_app_sid"
                                                value={formData.twiml_app_sid}
                                                onChange={handleChange}
                                                placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            />
                                            <Input
                                                label="From Number"
                                                name="from_number"
                                                value={formData.from_number}
                                                onChange={handleChange}
                                                placeholder="+1234567890"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Telnyx-specific fields */}
                            {formData.provider_type === 'telnyx' && (
                                <>
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Telnyx Configuration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="API Key"
                                                name="api_key"
                                                value={formData.api_key}
                                                onChange={handleChange}
                                                placeholder="KEYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                required
                                            />
                                            <Input
                                                label="Connection ID"
                                                name="connection_id"
                                                value={formData.connection_id}
                                                onChange={handleChange}
                                                placeholder="conn_xxxxxxxxxxxxxxxxxxxx"
                                                required
                                            />
                                            <Input
                                                label="Webhook API Secret (Optional)"
                                                name="webhook_secret"
                                                type="password"
                                                value={formData.webhook_secret}
                                                onChange={handleChange}
                                                placeholder="••••••••••••••••••••••••••••••••"
                                            />
                                            <Input
                                                label="From Number"
                                                name="from_number"
                                                value={formData.from_number}
                                                onChange={handleChange}
                                                placeholder="+1234567890"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Generic SIP fields */}
                            {formData.provider_type === 'sip' && (
                                <>
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">SIP Configuration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="SIP Server"
                                                name="sip_server"
                                                value={formData.sip_server}
                                                onChange={handleChange}
                                                placeholder="sip.example.com"
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
                                            <Input
                                                label="Username"
                                                name="sip_username"
                                                value={formData.sip_username}
                                                onChange={handleChange}
                                                placeholder="1001"
                                                required
                                            />
                                            <Input
                                                label="Password"
                                                name="sip_password"
                                                type="password"
                                                value={formData.sip_password}
                                                onChange={handleChange}
                                                placeholder="••••••••••••••••"
                                                required
                                            />
                                            <Select
                                                label="Transport"
                                                name="transport"
                                                value={formData.transport}
                                                onChange={handleChange}
                                                options={[
                                                    { value: 'UDP', label: 'UDP' },
                                                    { value: 'TCP', label: 'TCP' },
                                                    { value: 'TLS', label: 'TLS' },
                                                ]}
                                                required
                                            />
                                            <Input
                                                label="From Number"
                                                name="from_number"
                                                value={formData.from_number}
                                                onChange={handleChange}
                                                placeholder="+1234567890"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Actions */}
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
                                    {loading ? 'Creating...' : 'Create Provider'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
}
