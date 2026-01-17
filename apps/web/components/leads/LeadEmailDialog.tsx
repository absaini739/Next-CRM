'use client';

import { useRouter } from 'next/navigation';
import {
    XMarkIcon,
    EnvelopeIcon,
    EnvelopeOpenIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface LeadEmailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
}

export default function LeadEmailDialog({ isOpen, onClose, lead }: LeadEmailDialogProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const emails = [
        { label: 'Primary', value: lead.primary_email },
        { label: 'Secondary', value: lead.secondary_email },
    ].filter(e => e.value);

    // If no emails, just show a placeholder
    const displayEmails = emails.length > 0 ? emails : [{ label: 'Work', value: 'No email saved' }];

    const handleEmail = (email: string) => {
        if (!email || email === 'No email saved') return;
        router.push(`/emails?to=${encodeURIComponent(email)}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Email</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Select an email recipient for {lead.first_name || lead.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {displayEmails.map((email, i) => {
                        const isDisabled = email.value === 'No email saved';

                        return (
                            <button
                                key={i}
                                disabled={isDisabled}
                                onClick={() => handleEmail(email.value!)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isDisabled
                                    ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 cursor-not-allowed'
                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 dark:hover:border-blue-400 group'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-lg mr-4 ${isDisabled ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        <EnvelopeIcon className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{email.label}</p>
                                        <p className={`text-lg font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{email.value}</p>
                                    </div>
                                </div>
                                {!isDisabled && (
                                    <EnvelopeOpenIcon className="h-6 w-6 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}
