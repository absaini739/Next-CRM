import { formatDistanceToNow } from 'date-fns';
import { EnvelopeIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';

interface EmailMessage {
    id: number;
    from_email: string;
    from_name?: string;
    to: any;
    subject: string;
    body_html?: string;
    body_text?: string;
    snippet?: string;
    sent_at?: Date;
    received_at?: Date;
    is_read: boolean;
    sent_from_crm: boolean;
}

interface EmailTimelineProps {
    emails: EmailMessage[];
    onReply?: (email: EmailMessage) => void;
    onForward?: (email: EmailMessage) => void;
}

export default function EmailTimeline({ emails, onReply, onForward }: EmailTimelineProps) {
    if (!emails || emails.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No emails found</p>
            </div>
        );
    }

    const formatRecipients = (recipients: any) => {
        if (Array.isArray(recipients)) {
            return recipients.map((r: any) => typeof r === 'string' ? r : r.email).join(', ');
        }
        return recipients;
    };

    return (
        <div className="space-y-4">
            {emails.map((email) => {
                const timestamp = email.sent_at || email.received_at;
                const isSent = email.sent_from_crm;

                return (
                    <div
                        key={email.id}
                        className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-800"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {isSent ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            Sent
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            Received
                                        </span>
                                    )}
                                    {timestamp && (
                                        <span className="text-xs text-gray-500 dark:text-slate-400">
                                            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                    {email.from_name || email.from_email}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">
                                    To: {formatRecipients(email.to)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {onReply && (
                                    <button
                                        onClick={() => onReply(email)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title="Reply"
                                    >
                                        <ArrowUturnLeftIcon className="h-4 w-4" />
                                    </button>
                                )}
                                {onForward && (
                                    <button
                                        onClick={() => onForward(email)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title="Forward"
                                    >
                                        <ArrowUturnRightIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            {email.subject || '(No Subject)'}
                        </div>

                        {/* Body Preview */}
                        <div className="text-sm text-gray-600 dark:text-slate-300 line-clamp-3">
                            {email.snippet || email.body_text || 'No content'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
