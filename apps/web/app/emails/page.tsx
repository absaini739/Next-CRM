'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
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
    PencilSquareIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

interface EmailAccount {
    id: number;
    email: string;
    provider: string;
    is_default: boolean;
}

interface Email {
    id: number;
    from_name: string;
    from_email: string;
    subject: string;
    snippet: string;
    folder: string;
    is_read: boolean;
    has_attachments: boolean;
    received_at: string;
    created_at: string;
}

// Re-adding interface needed for state
interface EmailAccount {
    id: number;
    email: string;
    provider: string;
    is_default: boolean;
}

import EmailDetail from '@/components/emails/EmailDetail';
import ComposeEmail from '@/components/emails/ComposeEmail';

export default function EmailsPage() {
    const [accounts, setAccounts] = useState<EmailAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [folder, setFolder] = useState('inbox');
    const [emails, setEmails] = useState<Email[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCompose, setShowCompose] = useState(false);
    const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
    const [search, setSearch] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEmails, setTotalEmails] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Detail view state
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);

    // Compose form state
    const [composeData, setComposeData] = useState<{
        to?: string;
        subject?: string;
        body?: string;
        selectedAccountId?: number;
    } | undefined>(undefined);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            const defaultAccount = accounts.find(a => a.is_default) || accounts[0];
            setSelectedAccountId(defaultAccount.id.toString());
        }
    }, [accounts]);

    useEffect(() => {
        if (selectedAccountId && view === 'list') {
            setCurrentPage(1); // Reset to page 1 when filters change
            fetchEmails();
            fetchCounts();
        }
    }, [selectedAccountId, folder, search, view]);

    useEffect(() => {
        if (selectedAccountId && view === 'list') {
            fetchEmails();
        }
    }, [currentPage, itemsPerPage]);

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/email-accounts');
            setAccounts(response.data);
        } catch (error) {
            toast.error('Failed to load email accounts');
        }
    };

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/emails`, {
                params: {
                    account_id: selectedAccountId,
                    folder,
                    search,
                    page: currentPage,
                    limit: itemsPerPage
                }
            });
            setEmails(response.data.data);
            setTotalPages(response.data.pagination.pages);
            setTotalEmails(response.data.pagination.total);
        } catch (error) {
            console.error('Failed to fetch emails');
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const response = await api.get('/emails/folders/counts', {
                params: { account_id: selectedAccountId }
            });
            setCounts(response.data);
        } catch (error) {
            console.error('Failed to fetch counts');
        }
    };

    const handleSuccess = () => {
        // Refresh if in sent folder or just to update counts
        if (folder === 'sent' && view === 'list') fetchEmails();
        fetchCounts();
    };

    const handleEmailClick = (id: number) => {
        setSelectedEmailId(id);
        setView('detail');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedEmailId(null);
        // Refresh list to update read status
        fetchEmails();
        fetchCounts();
    };

    const handleReply = (email: any) => {
        setComposeData({
            to: email.from_email,
            subject: `Re: ${email.subject}`,
            body: `\n\n\nOn ${new Date(email.created_at).toLocaleString()}, ${email.from_name || email.from_email} wrote:\n> ${email.body_text || email.snippet || ''}`,
            selectedAccountId: parseInt(selectedAccountId)
        });
        setShowCompose(true);
    };

    const handleForward = (email: any) => {
        setComposeData({
            to: '',
            subject: `Fwd: ${email.subject}`,
            body: `\n\n---------- Forwarded message ---------\nFrom: ${email.from_name || email.from_email} <${email.from_email}>\nDate: ${new Date(email.created_at).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body_text || email.snippet || ''}`,
            selectedAccountId: parseInt(selectedAccountId)
        });
        setShowCompose(true);
    };

    const handleArchive = async (id: number) => {
        try {
            await api.patch(`/emails/${id}`, { folder: 'archive' });
            toast.success('Email archived');
            if (view === 'detail') {
                handleBackToList();
            } else {
                fetchEmails();
                fetchCounts();
            }
        } catch (error) {
            toast.error('Failed to archive email');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this email?')) return;

        try {
            await api.delete(`/emails/${id}`);
            toast.success('Email deleted');
            if (view === 'detail') {
                handleBackToList();
            } else {
                fetchEmails();
                fetchCounts();
            }
        } catch (error) {
            toast.error('Failed to delete email');
        }
    };

    const folders = [
        { id: 'inbox', label: 'Inbox', icon: InboxIcon, count: counts.inbox || 0 },
        { id: 'draft', label: 'Drafts', icon: DocumentTextIcon, count: counts.draft || 0 },
        { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon, count: counts.sent || 0 },
        { id: 'archive', label: 'Archive', icon: ArchiveBoxIcon, count: counts.archive || 0 },
        { id: 'trash', label: 'Trash', icon: TrashIcon, count: counts.trash || 0 },
    ];

    const toggleEmailSelection = (id: number) => {
        setSelectedEmails(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-slate-300">
                    <span>Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalEmails)} of {totalEmails}
                    </span>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                        Previous
                    </button>

                    {startPage > 1 && (
                        <span className="px-2 text-gray-500">...</span>
                    )}

                    {pageNumbers.map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded border ${currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <span className="px-2 text-gray-500">...</span>
                    )}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                        Last
                    </button>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
                {/* Sidebar */}
                <div className="w-full lg:w-96 flex-shrink-0 flex flex-col space-y-4 overflow-y-auto lg:max-h-full">
                    <Button
                        variant="primary"
                        onClick={() => setShowCompose(true)}
                        className="w-full flex items-center justify-center py-3"
                    >
                        <PencilSquareIcon className="h-5 w-5 mr-2" />
                        Compose Mail
                    </Button>

                    <Card className="p-3 bg-white dark:bg-slate-800">
                        <div className="mb-4">
                            <Select
                                label="Account"
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                options={accounts.map(acc => ({
                                    value: acc.id.toString(),
                                    label: acc.email
                                }))}
                            />
                        </div>

                        <nav className="space-y-1">
                            {folders.map((f) => {
                                const Icon = f.icon;
                                const isActive = folder === f.id;
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => {
                                            setFolder(f.id);
                                            setView('list');
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
                                            <span>{f.label}</span>
                                        </div>
                                        {f.count > 0 && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${isActive
                                                ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
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
                <div className="flex-1 flex flex-col space-y-4 min-w-0 min-h-0">
                    {view === 'detail' && selectedEmailId ? (
                        <div className="h-full">
                            <EmailDetail
                                emailId={selectedEmailId}
                                onBack={handleBackToList}
                                onReply={handleReply}
                                onForward={handleForward}
                                onArchive={handleArchive}
                                onDelete={handleDelete}
                            />
                        </div>
                    ) : (
                        <>
                            {/* List View Header Controls */}
                            <Card className="p-4">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative flex-1">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search emails..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => fetchEmails()}
                                        className="whitespace-nowrap"
                                    >
                                        Refresh
                                    </Button>
                                </div>
                            </Card>

                            {/* Email List */}
                            <div className="flex-1 bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col min-h-0 overflow-hidden">
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left w-12">
                                                    <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-slate-700" />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-1/4">
                                                    {folder === 'sent' ? 'To' : 'From'}
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-32">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-20">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                            <p>Loading emails...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : emails.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-16 text-center text-gray-500 dark:text-slate-400">
                                                        <EnvelopeIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                                                        <p className="text-lg font-medium text-gray-900 dark:text-slate-300">No emails found</p>
                                                        <p className="text-sm">Your {folder} is empty</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                emails.map((email) => (
                                                    <tr
                                                        key={email.id}
                                                        onClick={() => handleEmailClick(email.id)}
                                                        className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${!email.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedEmails.includes(email.id)}
                                                                onChange={() => toggleEmailSelection(email.id)}
                                                                className="rounded border-gray-300 dark:border-gray-600 dark:bg-slate-700"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className={`text-sm truncate max-w-[200px] ${!email.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>
                                                                {email.from_name || email.from_email}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col">
                                                                <span className={`text-sm ${!email.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>
                                                                    {email.subject || '(No Subject)'}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                                                                    {email.snippet}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                                            {new Date(email.received_at || email.created_at).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => handleDelete(email.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                title="Delete email"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {!loading && emails.length > 0 && renderPagination()}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            <ComposeEmail
                open={showCompose}
                onClose={() => {
                    setShowCompose(false);
                    setComposeData(undefined);
                }}
                onSuccess={handleSuccess}
                accounts={accounts}
                initialData={composeData}
            />
        </DashboardLayout>
    );
}
