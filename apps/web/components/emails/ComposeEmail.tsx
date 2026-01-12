import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PencilSquareIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import TemplateSelector from './TemplateSelector';

interface EmailAccount {
    id: number;
    email: string;
    provider: string;
    is_default: boolean;
}

interface ComposeEmailProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accounts: EmailAccount[];
    initialData?: {
        to?: string;
        subject?: string;
        body?: string;
        selectedAccountId?: number;
    };
}

export default function ComposeEmail({ open, onClose, onSuccess, accounts, initialData }: ComposeEmailProps) {
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    // Scheduling (optional future feature, kept UI for consistency but simplified logic)
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');

    useEffect(() => {
        if (open) {
            // Initialize form state
            if (initialData?.to) setTo(initialData.to);
            if (initialData?.subject) setSubject(initialData.subject);
            if (initialData?.body) setBody(initialData.body);

            // Set account
            if (initialData?.selectedAccountId) {
                setSelectedAccountId(initialData.selectedAccountId.toString());
            } else if (accounts.length > 0 && !selectedAccountId) {
                const defaultAccount = accounts.find(a => a.is_default) || accounts[0];
                setSelectedAccountId(defaultAccount.id.toString());
            }
        }
    }, [open, initialData, accounts]);

    const handleSendEmail = async () => {
        if (!selectedAccountId) {
            toast.error('Please select an email account');
            return;
        }

        if (!to || !subject) {
            toast.error('Please fill in recipient and subject');
            return;
        }

        setSending(true);
        try {
            await api.post('/emails', {
                account_id: parseInt(selectedAccountId),
                to: to.split(',').map(e => e.trim()),
                cc: cc ? cc.split(',').map(e => e.trim()) : undefined,
                bcc: bcc ? bcc.split(',').map(e => e.trim()) : undefined,
                subject,
                body,
                tracking_enabled: trackingEnabled,
                folder: 'sent',
                scheduled_at: isScheduling && scheduledAt ? scheduledAt : undefined
            });

            toast.success(isScheduling ? 'Email scheduled successfully' : 'Email sent successfully');

            // Cleanup and close
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setTo('');
        setCc('');
        setBcc('');
        setShowCc(false);
        setShowBcc(false);
        setSubject('');
        setBody('');
        setScheduledAt('');
        setIsScheduling(false);
        setTrackingEnabled(false);
    };

    const handleTemplateSelect = (template: any) => {
        // Replace variables with placeholders or empty
        let subject = template.subject;
        let body = template.body;

        // Simple variable replacement - in production, show a modal to collect values
        if (template.variables && template.variables.length > 0) {
            template.variables.forEach((variable: string) => {
                const placeholder = `[${variable.toUpperCase()}]`;
                subject = subject.replace(`{${variable}}`, placeholder);
                body = body.replace(new RegExp(`\\{${variable}\\}`, 'g'), placeholder);
            });
        }

        setSubject(subject);
        setBody(body);
        toast.success('Template loaded! Replace placeholders with actual values.');
    };

    const handleDiscard = () => {
        resetForm();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 rounded-t-xl">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <PencilSquareIcon className="h-5 w-5 mr-2 text-blue-500" />
                        New Message
                    </h2>
                    <button
                        onClick={handleDiscard}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Template Selector */}
                    <div className="flex justify-end">
                        <TemplateSelector onSelect={handleTemplateSelect} />
                    </div>

                    {/* Account Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">From</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            disabled={sending}
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.email} ({acc.provider})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">To</label>
                            <div className="flex gap-2">
                                {!showCc && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCc(true)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        + Cc
                                    </button>
                                )}
                                {!showBcc && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBcc(true)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        + Bcc
                                    </button>
                                )}
                            </div>
                        </div>
                        <Input
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="recipient@example.com (comma separated)"
                        />
                    </div>

                    {showCc && (
                        <Input
                            label="Cc"
                            value={cc}
                            onChange={(e) => setCc(e.target.value)}
                            placeholder="cc@example.com (comma separated)"
                        />
                    )}

                    {showBcc && (
                        <Input
                            label="Bcc"
                            value={bcc}
                            onChange={(e) => setBcc(e.target.value)}
                            placeholder="bcc@example.com (comma separated)"
                        />
                    )}

                    <Input
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                    />

                    <div className="flex items-center space-x-4 py-1">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="tracking-check"
                                checked={trackingEnabled}
                                onChange={(e) => setTrackingEnabled(e.target.checked)}
                                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
                            />
                            <label htmlFor="tracking-check" className="text-sm text-gray-700 dark:text-slate-300 select-none cursor-pointer">
                                Enable email tracking
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="schedule-check"
                                checked={isScheduling}
                                onChange={(e) => setIsScheduling(e.target.checked)}
                                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
                            />
                            <label htmlFor="schedule-check" className="text-sm text-gray-700 dark:text-slate-300 select-none cursor-pointer">
                                Schedule for later
                            </label>
                        </div>
                    </div>

                    {isScheduling && (
                        <Input
                            type="datetime-local"
                            label="Schedule Time"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                    )}

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Message</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={12}
                            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed resize-none"
                            placeholder="Write your message here..."
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3 bg-gray-50 dark:bg-slate-800/50 rounded-b-xl">
                    <Button variant="secondary" onClick={handleDiscard} disabled={sending}>
                        Discard
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSendEmail}
                        disabled={sending}
                        className="pl-4 pr-6"
                    >
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        {sending ? 'Sending...' : (isScheduling ? 'Schedule Send' : 'Send Message')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
