import { format } from 'date-fns';
import {
    ArrowLeftIcon,
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    TrashIcon,
    ArchiveBoxIcon,
    PaperClipIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DOMPurify from 'dompurify';

interface Attachment {
    id: number;
    filename: string;
    size: number;
    content_type: string;
}

interface EmailMessage {
    id: number;
    from_name: string;
    from_email: string;
    to: any;
    subject: string;
    body_html?: string;
    body_text?: string;
    received_at: string;
    created_at: string;
    attachments: Attachment[];
    folder: string;
}

interface EmailDetailProps {
    emailId: number;
    onBack: () => void;
    onReply: (email: EmailMessage) => void;
    onForward: (email: EmailMessage) => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function EmailDetail({ emailId, onBack, onReply, onForward, onArchive, onDelete }: EmailDetailProps) {
    const [email, setEmail] = useState<EmailMessage | null>(null);
    const [thread, setThread] = useState<EmailMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmailDetails();
    }, [emailId]);

    const fetchEmailDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/emails/${emailId}`);
            setEmail(response.data);

            // If it has a thread, fetch the thread
            if (response.data.thread_id) {
                // Fetch thread (implementation depends on if we added /thread endpoint, let's assume we use the getEmail response which might include thread messages if we updated the controller to return them directly or fetch via a separate call. 
                // Based on my previous tool call, I updated getEmail to include `thread.messages`.
                if (response.data.thread?.messages) {
                    setThread(response.data.thread.messages);
                }
            } else {
                setThread([response.data]);
            }
        } catch (error) {
            console.error('Failed to fetch email details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAttachment = async (emailId: number, attachmentId: number, filename: string) => {
        try {
            const response = await api.get(`/emails/${emailId}/attachments/${attachmentId}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download attachment:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!email) {
        return <div>Email not found</div>;
    }

    // Display the thread or just the single email
    const messagesToDisplay = thread.length > 0 ? thread : [email];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                    </button>
                    <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white truncate max-w-md">
                        {email.subject}
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => onDelete(email.id)}>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onArchive(email.id)}>
                        <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                        Archive
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onForward(email)}>
                        <ArrowUturnRightIcon className="h-4 w-4 mr-1" />
                        Forward
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onReply(email)}>
                        <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                        Reply
                    </Button>
                </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-slate-900">
                {messagesToDisplay.map((msg, index) => (
                    <div key={msg.id} className={`border border-gray-200 dark:border-slate-700 rounded-lg p-6 ${msg.id === emailId ? 'bg-white dark:bg-slate-800 shadow-md ring-1 ring-blue-500/20' : 'bg-gray-50 dark:bg-slate-800/50'}`}>
                        {/* Message Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start space-x-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg">
                                    {msg.from_name ? msg.from_name[0].toUpperCase() : (msg.from_email ? msg.from_email[0].toUpperCase() : '?')}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {msg.from_name || msg.from_email}
                                        {msg.from_email && msg.from_name && <span className="text-gray-500 font-normal text-sm ml-2">&lt;{msg.from_email}&gt;</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                        To: {Array.isArray(msg.to) ? msg.to.join(', ') : msg.to}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">
                                {format(new Date(msg.received_at || msg.created_at), 'MMM d, yyyy h:mm a')}
                            </div>
                        </div>

                        {/* Message Body */}
                        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-slate-200">
                            {msg.body_html ? (
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.body_html) }} />
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.body_text || '(No content)'}</div>
                            )}
                        </div>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                    <PaperClipIcon className="h-4 w-4 mr-2" />
                                    {msg.attachments.length} Attachments
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {msg.attachments.map(att => (
                                        <button
                                            key={att.id}
                                            onClick={() => handleDownloadAttachment(msg.id, att.id, att.filename)}
                                            className="flex items-center p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer text-left"
                                        >
                                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                                                <DocumentIcon className="h-4 w-4" />
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={att.filename}>{att.filename}</div>
                                                <div className="text-xs text-gray-500 dark:text-slate-400">{(att.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                            <ArrowDownTrayIcon className="h-4 w-4 text-gray-400 dark:text-slate-500 ml-2" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function DocumentIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    );
}
