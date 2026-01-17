'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    XMarkIcon,
    EnvelopeIcon,
    PhoneIcon,
    GlobeAltIcon,
    ChevronDownIcon,
    PaperClipIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface LeadDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any | null;
    onEdit: (lead: any) => void;
}

export default function LeadDetailPanel({ isOpen, onClose, lead, onEdit }: LeadDetailPanelProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'detail' | 'attachment'>('detail');
    const [isGeneralExpanded, setIsGeneralExpanded] = useState(true);
    const [showCallHistory, setShowCallHistory] = useState(false);

    if (!lead) return null;

    const initials = lead.first_name ? lead.first_name.substring(0, 1) + (lead.last_name ? lead.last_name.substring(0, 1) : '') : 'L';

    // Filter calls from activities
    const calls = lead.activities?.filter((a: any) => a.type === 'call') || [];

    return (
        <div
            className={`fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-slate-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-slate-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="h-full flex flex-col overflow-hidden">
                {/* Header Section (Screenshot 2 Style) */}
                <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                                {initials.toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    {lead.first_name} {lead.last_name || ''}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                    Person Name : <span className="text-blue-600 dark:text-blue-400">{lead.first_name} {lead.last_name || ''}</span>
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                                        <PhoneIcon className="h-3.5 w-3.5 mr-1" />
                                        {lead.phone || 'NA'}
                                    </div>
                                    <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-bold tracking-wider">
                                        <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
                                        <span className="lowercase">{lead.primary_email || 'NA'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-3 py-1">
                                    Status: {lead.stage?.name || 'Qualified'}
                                </Badge>
                                <button
                                    onClick={() => onEdit(lead)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowCallHistory(!showCallHistory)}
                                    className="text-[10px] font-bold text-orange-500 flex items-center hover:underline"
                                >
                                    <ArrowPathIcon className={`h-3 w-3 mr-1 ${showCallHistory ? 'rotate-180' : ''} transition-transform`} />
                                    {showCallHistory ? 'Hide History' : 'Call History'}
                                </button>
                                <p className="text-[10px] text-gray-400 font-bold">
                                    Last Updated: {new Date(lead.updated_at).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-800 border-b border-gray-100 dark:border-slate-800 py-2">
                    <div className="px-6 py-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lead Priority: <span className="text-gray-700 dark:text-white ml-1 font-normal lowercase capitalize">{lead.lead_rating || 'Cold'}</span></p>
                    </div>
                    <div className="px-6 py-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned To: <span className="text-gray-700 dark:text-white ml-1 font-normal">{lead.assigned_to?.name || 'Shiva Sharma'}</span></p>
                    </div>
                    <div className="px-6 py-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source: <span className="text-gray-700 dark:text-white ml-1 font-normal">{lead.source?.name || 'YouTube Interview'}</span></p>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30 dark:bg-slate-950">
                    <div className="px-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('detail')}
                                className={`py-4 px-1 border-b-2 font-bold text-xs transition-colors uppercase tracking-widest flex items-center ${activeTab === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                            >
                                <GlobeAltIcon className="h-4 w-4 mr-2" />
                                Detail
                            </button>
                            <button
                                onClick={() => setActiveTab('attachment')}
                                className={`py-4 px-1 border-b-2 font-bold text-xs transition-colors uppercase tracking-widest flex items-center ${activeTab === 'attachment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                            >
                                <PaperClipIcon className="h-4 w-4 mr-2" />
                                Attachment
                            </button>
                        </nav>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {showCallHistory ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                                        <ArrowPathIcon className="h-4 w-4 mr-2 text-orange-500" />
                                        Recent Call History
                                    </h3>
                                    <Badge className="bg-orange-50 text-orange-700 border-orange-100">{calls.length} Calls</Badge>
                                </div>

                                {calls.length > 0 ? (
                                    <div className="space-y-3">
                                        {calls.map((call: any) => (
                                            <div key={call.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-start space-x-4">
                                                <div className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                                    <PhoneIcon className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{call.title || 'Inbound Call'}</p>
                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                            {new Date(call.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{call.description || 'No detailed log available.'}</p>
                                                    <div className="mt-2 flex items-center space-x-3">
                                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Completed</span>
                                                        <span className="text-[10px] text-gray-400 flex items-center">
                                                            <ClockIcon className="h-3 w-3 mr-1" />
                                                            {call.duration || '2m 14s'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-slate-800">
                                        <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                            <ArrowPathIcon className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">No calls found</p>
                                            <p className="text-xs text-gray-500 mt-1">There is no recorded call history for this lead yet.</p>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="secondary"
                                    className="w-full py-3 border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest"
                                    onClick={() => setShowCallHistory(false)}
                                >
                                    Back to Details
                                </Button>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'detail' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                            <button
                                                onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-50 dark:border-slate-800"
                                            >
                                                <h4 className="text-[13px] font-bold text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-200">General Information</h4>
                                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isGeneralExpanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isGeneralExpanded && (
                                                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-1">Created Date</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-slate-400">{new Date(lead.created_at).toLocaleDateString('en-GB')}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-1">Location</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-slate-400 uppercase">{lead.location || 'NA'}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-1">Turnover</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-slate-400 font-medium">₹ {(parseFloat(lead.lead_value) || 0).toFixed(2).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-1">Created By</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-slate-400">{lead.user?.name || 'shiva Sharma'}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-1">Product Interest</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-slate-400 uppercase">{lead.product_interest || 'NA'}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-1">Remarks</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-slate-400 uppercase">{lead.description || 'NA'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'attachment' && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                            <PaperClipIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">No attachments found</p>
                                            <p className="text-xs text-gray-500 mt-1">Files uploaded to this lead will appear here.</p>
                                        </div>
                                        <Button variant="secondary" size="sm" className="mt-2">Upload File</Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop blur */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[2px] transition-all -z-10"
                    onClick={onClose}
                />
            )}
        </div>
    );
}
