'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    InboxIcon,
    DocumentTextIcon,
    PaperAirplaneIcon,
    ArchiveBoxIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

interface Email {
    id: number;
    from: string;
    to: string[];
    subject: string;
    body: string;
    folder: string;
    is_read: boolean;
    is_starred: boolean;
    created_at: string;
    person?: { name: string };
}

export default function EmailsPage() {
    const [folder, setFolder] = useState('inbox');
    const [emails, setEmails] = useState<Email[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCompose, setShowCompose] = useState(false);
    const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
    const [search, setSearch] = useState('');

    // Compose form state
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchEmails();
        fetchCounts();
    }, [folder, search]);

    const fetchEmails = async () => {
        try {
            const response = await api.get(`/emails?folder=${folder}&search=${search}`);
            setEmails(response.data.emails);
        } catch (error) {
            console.error('Failed to fetch emails');
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const response = await api.get('/emails/folders/counts');
            setCounts(response.data);
        } catch (error) {
            console.error('Failed to fetch counts');
        }
    };

    const handleSendEmail = async () => {
        if (!to || !subject) {
            toast.error('Please fill in recipient and subject');
            return;
        }

        setSending(true);
        try {
            await api.post('/emails', {
                from: 'user@example.com', // Should come from logged-in user
                to: to.split(',').map(e => e.trim()),
                subject,
                body,
                folder: 'sent',
                scheduled_at: isScheduling && scheduledAt ? scheduledAt : undefined
            });
            toast.success(isScheduling ? 'Email scheduled successfully' : 'Email sent successfully');
            setShowCompose(false);
            setTo('');
            setSubject('');
            setBody('');
            setScheduledAt('');
            setIsScheduling(false);
            fetchEmails();
            fetchCounts();
        } catch (error) {
            toast.error('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const folders = [
        { id: 'inbox', label: 'Inbox', icon: InboxIcon, count: counts.inbox || 0 },
        { id: 'draft', label: 'Draft', icon: DocumentTextIcon, count: counts.draft || 0 },
        { id: 'outbox', label: 'Outbox', icon: PaperAirplaneIcon, count: counts.outbox || 0 },
        { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon, count: counts.sent || 0 },
        { id: 'archive', label: 'Archive', icon: ArchiveBoxIcon, count: counts.archive || 0 },
        { id: 'trash', label: 'Trash', icon: TrashIcon, count: counts.trash || 0 },
    ];

    const toggleEmailSelection = (id: number) => {
        setSelectedEmails(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-4rem)] gap-6">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0 space-y-4">
                    <Button
                        variant="primary"
                        onClick={() => setShowCompose(true)}
                        className="w-full flex items-center justify-center"
                    >
                        <PencilSquareIcon className="h-5 w-5 mr-2" />
                        Compose Mail
                    </Button>

                    <Card className="p-4">
                        <nav className="space-y-1">
                            {folders.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => setFolder(f.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${folder === f.id
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Icon className="h-5 w-5 mr-3" />
                                            <span>{f.label}</span>
                                        </div>
                                        {f.count > 0 && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${folder === f.id ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                {f.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-4">
                    {/* Header */}
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <FunnelIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search emails..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Per Page: <select className="border rounded px-2 py-1">
                                    <option>10</option>
                                    <option>25</option>
                                    <option>50</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Email List */}
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input type="checkbox" className="rounded" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Attachments / Tags / Subject / Content
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                Loading emails...
                                            </td>
                                        </tr>
                                    ) : emails.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                No emails found
                                            </td>
                                        </tr>
                                    ) : (
                                        emails.map((email) => (
                                            <tr
                                                key={email.id}
                                                className={`hover:bg-gray-50 cursor-pointer ${!email.is_read ? 'bg-blue-50/30' : ''
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmails.includes(email.id)}
                                                        onChange={() => toggleEmailSelection(email.id)}
                                                        className="rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`text-sm ${!email.is_read ? 'font-semibold' : 'font-normal'}`}>
                                                                    {email.from}
                                                                </span>
                                                                {!email.is_read && (
                                                                    <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">{email.subject}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-500">
                                                    {new Date(email.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Compose Modal */}
            {showCompose && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Compose Email</h2>
                            <button
                                onClick={() => setShowCompose(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input
                                label="To"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="recipient@example.com"
                            />
                            <Input
                                label="Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject"
                            />

                            {/* Schedule Option */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="schedule-check"
                                    checked={isScheduling}
                                    onChange={(e) => setIsScheduling(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="schedule-check" className="text-sm text-gray-700">
                                    Schedule for later
                                </label>
                            </div>

                            {isScheduling && (
                                <Input
                                    type="datetime-local"
                                    label="Schedule Time"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                />
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Write your message..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end space-x-3">
                            <Button variant="secondary" onClick={() => setShowCompose(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSendEmail} disabled={sending}>
                                {sending ? 'Sending...' : (isScheduling ? 'Schedule Email' : 'Send Email')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
