import { useState } from 'react';
import { ExclamationTriangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UnknownEmailBannerProps {
    emailMessage: {
        id: number;
        from_email: string;
        from_name?: string;
        subject: string;
    };
    onLeadCreated?: (leadId: number) => void;
}

export default function UnknownEmailBanner({ emailMessage, onLeadCreated }: UnknownEmailBannerProps) {
    const [creating, setCreating] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleCreateLead = async () => {
        setCreating(true);
        try {
            // Extract name from email or use email address
            const nameFromEmail = emailMessage.from_name || emailMessage.from_email.split('@')[0];
            const nameParts = nameFromEmail.split(' ');

            const leadData = {
                title: `Lead from ${emailMessage.from_email}`,
                first_name: nameParts[0] || nameFromEmail,
                last_name: nameParts.slice(1).join(' ') || undefined,
                primary_email: emailMessage.from_email,
                description: `Auto-created from email: ${emailMessage.subject}`,
            };

            const { data } = await api.post('/leads', leadData);

            toast.success(`Lead created: ${data.title}`);
            if (onLeadCreated) {
                onLeadCreated(data.id);
            }
            setDismissed(true);
        } catch (error: any) {
            console.error('Error creating lead:', error);
            toast.error(error.response?.data?.message || 'Failed to create lead');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                        Unknown Sender
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                        <strong>{emailMessage.from_email}</strong> is not in your CRM. Create a lead to start tracking this contact.
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleCreateLead}
                            disabled={creating}
                            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
                        >
                            <UserPlusIcon className="h-4 w-4" />
                            {creating ? 'Creating...' : 'Create Lead'}
                        </Button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
