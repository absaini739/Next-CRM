'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
    PlusIcon,
    InboxIcon,
    PaperAirplaneIcon,
    ArchiveBoxIcon,
    TrashIcon,
    StarIcon,
    PaperClipIcon
} from '@heroicons/react/24/outline';

export default function EmailPage() {
    const [selectedEmail, setSelectedEmail] = useState<any>(null);
    const [composeOpen, setComposeOpen] = useState(false);
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [emails] = useState([
        {
            id: 1,
            from: 'John Doe',
            email: 'john@example.com',
            subject: 'Re: Product Demo Request',
            preview: 'Thanks for reaching out! I would love to schedule a demo...',
            time: '10:30 AM',
            read: false,
            starred: true,
            hasAttachment: true,
        },
        {
            id: 2,
            from: 'Jane Smith',
            email: 'jane@company.com',
            subject: 'Quote Follow-up',
            preview: 'I reviewed the quote you sent last week and have a few questions...',
            time: '9:15 AM',
            read: true,
            starred: false,
            hasAttachment: false,
        },
        {
            id: 3,
            from: 'Mike Johnson',
            email: 'mike@business.com',
            subject: 'Meeting Confirmation',
            preview: 'Confirming our meeting scheduled for tomorrow at 2 PM...',
            time: 'Yesterday',
            read: true,
            starred: false,
            hasAttachment: false,
        },
    ]);

    const folders = [
        { id: 'inbox', name: 'Inbox', count: 12, icon: InboxIcon },
        { id: 'sent', name: 'Sent', count: 45, icon: PaperAirplaneIcon },
        { id: 'archived', name: 'Archived', count: 128, icon: ArchiveBoxIcon },
        { id: 'trash', name: 'Trash', count: 8, icon: TrashIcon },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Email</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage your email communications
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setComposeOpen(true)}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Compose
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <div className="space-y-2">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        onClick={() => setActiveFolder(folder.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeFolder === folder.id
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <folder.icon className="h-5 w-5" />
                                            <span className="font-medium">{folder.name}</span>
                                        </div>
                                        <Badge variant={activeFolder === folder.id ? 'info' : 'default'} size="sm">
                                            {folder.count}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Email List */}
                    <div className="lg:col-span-3">
                        <Card>
                            <div className="space-y-2">
                                {emails.map((email) => (
                                    <div
                                        key={email.id}
                                        onClick={() => setSelectedEmail(email)}
                                        className={`p-4 rounded-lg cursor-pointer transition-colors ${!email.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                                            } ${selectedEmail?.id === email.id ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    {email.starred && (
                                                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                    <h4 className={`font-medium ${!email.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {email.from}
                                                    </h4>
                                                    {email.hasAttachment && (
                                                        <PaperClipIcon className="h-4 w-4 text-gray-400 dark:text-slate-400" />
                                                    )}
                                                </div>
                                                <p className={`text-sm ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                    {email.subject}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-slate-500 truncate mt-1">{email.preview}</p>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-slate-500 ml-4">{email.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Email Detail */}
                        {selectedEmail && (
                            <Card className="mt-6" title={selectedEmail.subject}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-slate-100">{selectedEmail.from}</div>
                                            <div className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">{selectedEmail.email}</div>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-slate-500">{selectedEmail.time}</div>
                                    </div>
                                    <div className="prose max-w-none">
                                        <p>{selectedEmail.preview}</p>
                                        <p className="mt-4">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                            exercitation ullamco laboris.
                                        </p>
                                    </div>
                                    <div className="flex space-x-2 pt-4 border-t">
                                        <Button variant="primary" size="sm">Reply</Button>
                                        <Button variant="secondary" size="sm">Forward</Button>
                                        <Button variant="ghost" size="sm">Archive</Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Compose Modal */}
            <Modal
                isOpen={composeOpen}
                onClose={() => setComposeOpen(false)}
                title="Compose Email"
                size="xl"
            >
                <form className="space-y-4">
                    <Select
                        label="To"
                        options={[
                            { value: '', label: 'Select recipient...' },
                            { value: '1', label: 'John Doe - john@example.com' },
                            { value: '2', label: 'Jane Smith - jane@company.com' },
                        ]}
                    />
                    <Input label="Subject" placeholder="Enter subject" />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={8}
                            placeholder="Type your message here..."
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="secondary" size="sm" type="button">
                            <PaperClipIcon className="h-4 w-4 mr-2" />
                            Attach File
                        </Button>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setComposeOpen(false)} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
