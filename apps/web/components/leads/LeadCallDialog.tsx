'use client';

import { useRouter } from 'next/navigation';
import {
    XMarkIcon,
    PhoneIcon,
    PhoneArrowUpRightIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface LeadCallDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
}

export default function LeadCallDialog({ isOpen, onClose, lead }: LeadCallDialogProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const numbers = [
        { label: 'Mobile', value: lead.mobile, icon: DevicePhoneMobileIcon },
        { label: 'Phone', value: lead.phone, icon: PhoneIcon },
    ].filter(n => n.value);

    // If no numbers, just show a placeholder
    const displayNumbers = numbers.length > 0 ? numbers : [{ label: 'Standard', value: 'No number saved', icon: PhoneIcon }];

    const handleCall = (number: string) => {
        if (!number || number === 'No number saved') return;
        // Navigate to VoIP page with dial parameter
        router.push(`/voip?dial=${encodeURIComponent(number)}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start Call</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Select a number to dial for {lead.first_name || lead.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {displayNumbers.map((num, i) => {
                        const Icon = num.icon;
                        const isDisabled = num.value === 'No number saved';

                        return (
                            <button
                                key={i}
                                disabled={isDisabled}
                                onClick={() => handleCall(num.value!)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isDisabled
                                        ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 cursor-not-allowed'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 dark:hover:border-blue-400 group'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-lg mr-4 ${isDisabled ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{num.label}</p>
                                        <p className={`text-lg font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{num.value}</p>
                                    </div>
                                </div>
                                {!isDisabled && (
                                    <PhoneArrowUpRightIcon className="h-6 w-6 text-gray-300 group-hover:text-blue-500 transition-colors" />
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
