'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ConnectEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ConnectEmailModal({ isOpen, onClose, onSuccess }: ConnectEmailModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        provider: 'gmail',
        email: '',
        password: '',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        displayName: ''
    });

    useEffect(() => {
        if (formData.provider === 'gmail') {
            setFormData(prev => ({
                ...prev,
                smtpHost: 'smtp.gmail.com',
                smtpPort: 465,
                imapHost: 'imap.gmail.com',
                imapPort: 993
            }));
        } else if (formData.provider === 'outlook') {
            setFormData(prev => ({
                ...prev,
                smtpHost: 'smtp.office365.com',
                smtpPort: 587,
                imapHost: 'outlook.office365.com',
                imapPort: 993
            }));
        }
    }, [formData.provider]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/emails/connect-manual', formData);
            toast.success('Account connected successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to connect account');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        Connect Email Account
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Select
                        label="Provider"
                        options={[
                            { value: 'gmail', label: 'Gmail (App Password)' },
                            { value: 'outlook', label: 'Outlook (App Password)' },
                            { value: 'other', label: 'Other / Custom SMTP' }
                        ]}
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                    />

                    <div className="relative">
                        <Input
                            label="App Password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="xxxx xxxx xxxx xxxx"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-[32px] text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                            Use an App Password, not your login password.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="SMTP Host"
                            value={formData.smtpHost}
                            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                        />
                        <Input
                            label="Port"
                            type="number"
                            value={formData.smtpPort}
                            onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="IMAP Host"
                            value={formData.imapHost}
                            onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                        />
                        <Input
                            label="Port"
                            type="number"
                            value={formData.imapPort}
                            onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Connecting...' : 'Connect Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
