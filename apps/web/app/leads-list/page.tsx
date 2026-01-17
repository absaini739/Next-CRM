'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    EnvelopeIcon,
    TrashIcon,
    UserIcon,
    ArrowPathIcon,
    StarIcon,
    PencilSquareIcon,
    EyeIcon,
    ChevronDownIcon,
    FunnelIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import LeadCallDialog from '@/components/leads/LeadCallDialog';
import LeadEmailDialog from '@/components/leads/LeadEmailDialog';
import LeadDetailPanel from '@/components/leads/LeadDetailPanel';
import LeadActionDropdown from '@/components/leads/LeadActionDropdown';
import LeadAssignDialog from '@/components/leads/LeadAssignDialog';
import LeadPriorityDialog from '@/components/leads/LeadPriorityDialog';
import LeadFollowUpDialog from '@/components/leads/LeadFollowUpDialog';
import LeadUpdateDialog from '@/components/leads/LeadUpdateDialog';

export default function LeadsListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const leadIdParam = searchParams.get('leadId');
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [callLead, setCallLead] = useState<any | null>(null);
    const [emailLead, setEmailLead] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Auth user ID (mock for now, ideally fetch from auth context)
    const currentUserId = 1; // Replace with actual auth user ID

    // Filter & Sort State
    const [filterType, setFilterType] = useState('recent'); // recent, all, mine, won, lost
    const [sortType, setSortType] = useState('score'); // score, date, name, company

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        if (leadIdParam && leads.length > 0) {
            const leadId = parseInt(leadIdParam);
            const lead = leads.find(l => l.id === leadId);
            if (lead) {
                setSelectedLead(lead);
                setIsDetailOpen(true);
            }
        }
    }, [leadIdParam, leads]);

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
        } catch (error) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailClick = (row: any) => {
        setEmailLead(row);
    };

    const [leadToAssign, setLeadToAssign] = useState<any>(null);
    const [leadForPriority, setLeadForPriority] = useState<any>(null);
    const [leadForFollowUp, setLeadForFollowUp] = useState<any>(null);
    const [leadToUpdate, setLeadToUpdate] = useState<any>(null);

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return;

        setLoading(true);
        try {
            await api.delete('/leads/bulk', { data: { ids: selectedIds } });
            toast.success(`Successfully deleted ${selectedIds.length} leads`);
            fetchLeads();
            setSelectedIds([]);
        } catch (error) {
            toast.error('Failed to delete leads');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedIds.length === 0) return;

        const firstId = selectedIds[0];
        const firstLead = leads.find(l => l.id === firstId);

        switch (action) {
            case 'edit':
                if (selectedIds.length === 1) {
                    setLeadToUpdate(firstLead);
                } else {
                    toast.info('Bulk Edit - Coming Soon');
                }
                break;
            case 'view':
                if (selectedIds.length === 1) {
                    setSelectedLead(firstLead);
                    setIsDetailOpen(true);
                } else {
                    toast.info('Please select a single lead to view details');
                }
                break;
            case 'assign':
                // Pass either the single lead object or the array of selected IDs
                setLeadToAssign(selectedIds.length > 1 ? selectedIds : firstLead);
                break;
            case 'follow_up':
                if (selectedIds.length === 1) {
                    setLeadForFollowUp(firstLead);
                } else {
                    toast.info('Bulk Follow-up - Coming Soon');
                }
                break;
            case 'delete':
                handleBulkDelete();
                break;
        }
    };

    const handleAction = (actionId: string, lead: any) => {
        switch (actionId) {
            case 'update':
                setLeadToUpdate(lead);
                break;
            case 'add_bp':
                toast.info(`Add BP for ${lead.first_name || lead.title} - Coming Soon`);
                break;
            case 'follow_up':
                setLeadForFollowUp(lead);
                break;
            case 'assign':
                setLeadToAssign(lead);
                break;
            case 'priority':
                setLeadForPriority(lead);
                break;
            default:
                break;
        }
    };

    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            width: '60px',
            render: (value: any, row: any) => (
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    #{row.id}
                </span>
            )
        },
        {
            key: 'company_name',
            label: 'COMPANY NAME',
            sortable: true,
            width: '180px',
            render: (value: any, row: any) => (
                <div className="flex items-center text-sm font-bold text-gray-700 dark:text-slate-300 truncate">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-sm shadow-blue-500/50 flex-shrink-0"></span>
                    <span className="truncate">{row.company_name || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'person_name',
            label: 'PERSON NAME',
            sortable: true,
            width: '180px',
            render: (value: any, row: any) => (
                <div className="flex items-center truncate">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.first_name || row.title)}&background=random`}
                        alt=""
                        className="h-7 w-7 rounded-full mr-2 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100 italic truncate">
                        {row.first_name} {row.last_name}
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'PHONE',
            width: '130px',
            render: (value: any, row: any) => (
                <div className="text-sm text-gray-600 dark:text-slate-400 font-medium truncate">
                    {row.phone || row.mobile || 'N/A'}
                </div>
            )
        },
        {
            key: 'status',
            label: 'STATUS',
            sortable: true,
            width: '110px',
            render: (value: any, row: any) => {
                const status = row.stage?.name || 'New';
                const colors: Record<string, string> = {
                    'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                    'Contacted': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                    'Qualified': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
                    'Lost': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-blue-800',
                    'Won': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                };
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${colors[status] || colors['New']}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            key: 'lead_rating',
            label: 'LEAD PRIORITY',
            sortable: true,
            width: '120px',
            render: (value: any, row: any) => {
                const priority = row.lead_rating || 'Medium';
                const colors: Record<string, string> = {
                    'Hot': 'text-red-600 dark:text-red-400',
                    'Warm': 'text-orange-600 dark:text-orange-400',
                    'Cold': 'text-blue-600 dark:text-blue-400',
                    'High': 'text-red-600 dark:text-red-400',
                    'Medium': 'text-orange-600 dark:text-orange-400',
                    'Low': 'text-blue-600 dark:text-blue-400',
                };
                return (
                    <span className={`text-[11px] font-extrabold uppercase tracking-tight ${colors[priority] || 'text-gray-500'}`}>
                        {priority}
                    </span>
                );
            }
        },
        {
            key: 'created_by',
            label: 'CREATED BY',
            width: '130px',
            render: (value: any, row: any) => (
                <div className="flex items-center truncate">
                    <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mr-2 border border-gray-200 dark:border-slate-600">
                        <span className="text-[9px] font-bold text-gray-600 dark:text-slate-400 uppercase">
                            {row.user?.name?.substring(0, 1) || 'U'}
                        </span>
                    </div>
                    <span className="text-[11px] text-gray-600 dark:text-slate-400 truncate">
                        {row.user?.name || 'System'}
                    </span>
                </div>
            )
        },
        {
            key: 'assigned_to',
            label: 'ASSIGNED TO',
            sortable: true,
            width: '140px',
            render: (value: any, row: any) => (
                <div className="flex items-center truncate">
                    <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 border border-blue-200 dark:border-blue-800">
                        <span className="text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                            {row.assigned_to?.name?.substring(0, 1) || '?'}
                        </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-200 truncate">
                        {row.assigned_to?.name || 'Unassigned'}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'ACTION',
            width: '100px',
            render: (value: any, row: any) => (
                <div className="flex items-center space-x-1.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); setCallLead(row); }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                        title="Call"
                    >
                        <PhoneIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEmailClick(row); }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                        title="Email"
                    >
                        <EnvelopeIcon className="h-4 w-4" />
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                        <LeadActionDropdown
                            lead={row}
                            onAction={handleAction}
                        />
                    </div>
                </div>
            )
        }
    ];

    // Filter Logic
    const getFilteredLeads = () => {
        let filtered = leads;

        // 1. Search Filter
        if (searchTerm) {
            filtered = filtered.filter(l =>
                (l.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (l.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (l.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (l.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }

        // 2. Type Filter
        switch (filterType) {
            case 'mine':
                filtered = filtered.filter(l => l.assigned_to_id === currentUserId || l.user_id === currentUserId);
                break;
            case 'won':
                filtered = filtered.filter(l => l.stage?.name === 'Won');
                break;
            case 'lost':
                filtered = filtered.filter(l => l.stage?.name === 'Lost');
                break;
            case 'recent':
                // Assuming 'recent' just means default sort, no additional filtering needed beyond date sort
                break;
        }

        // 3. Sorting
        return filtered.sort((a, b) => {
            switch (sortType) {
                case 'score':
                    return (b.lead_score || 0) - (a.lead_score || 0);
                case 'date':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'name':
                    return (a.first_name || a.title || '').localeCompare(b.first_name || b.title || '');
                case 'company':
                    return (a.company_name || '').localeCompare(b.company_name || '');
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                default:
                    return 0;
            }
        });
    };

    const filteredLeads = getFilteredLeads();

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const filterOptions = [
        { id: 'recent', name: 'Leads Recent' },
        { id: 'all', name: 'All Leads' },
        { id: 'mine', name: 'My Leads' },
        { id: 'won', name: 'Won Leads' },
        { id: 'lost', name: 'Lost Leads' },
    ];

    const sortOptions = [
        { id: 'score', name: 'Lead Score' },
        { id: 'date', name: 'Date Created (New)' },
        { id: 'oldest', name: 'Date Created (Old)' },
        { id: 'name', name: 'Name (A-Z)' },
        { id: 'company', name: 'Company (A-Z)' },
    ];

    const currentFilterName = filterOptions.find(f => f.id === filterType)?.name || 'All Leads';
    const currentSortName = sortOptions.find(s => s.id === sortType)?.name || 'Lead Score';

    return (
        <DashboardLayout noPadding>
            <div className="h-full w-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
                <main className="flex-1 flex flex-col px-8 py-4 transition-all duration-300 overflow-hidden">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div>
                            <div className="flex items-center space-x-4 mb-1">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Leads</h1>
                            </div>
                            <div className="flex items-center space-x-4 text-sm relative">
                                {/* Filter Dropdown */}
                                <Menu as="div" className="relative inline-block text-left">
                                    <Menu.Button className="text-blue-600 dark:text-blue-400 font-bold flex items-center cursor-pointer hover:underline decoration-blue-600/30 underline-offset-4 decoration-2 focus:outline-none">
                                        {currentFilterName}
                                        <ChevronDownIcon className="ml-1 h-4 w-4 stroke-[3]" />
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left divide-y divide-gray-100 dark:divide-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[60] border border-gray-100 dark:border-slate-800">
                                            <div className="p-1">
                                                {filterOptions.map((option) => (
                                                    <Menu.Item key={option.id}>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => setFilterType(option.id)}
                                                                className={`${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium`}
                                                            >
                                                                {option.name}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>

                                {/* Sort Dropdown */}
                                <span className="text-gray-400 dark:text-slate-500 flex items-center">
                                    Sort by:
                                    <Menu as="div" className="relative inline-block text-left ml-1">
                                        <Menu.Button className="text-gray-600 dark:text-slate-400 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center focus:outline-none">
                                            {currentSortName}
                                            <ArrowsUpDownIcon className="ml-1 h-3.5 w-3.5" />
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left divide-y divide-gray-100 dark:divide-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[60] border border-gray-100 dark:border-slate-800">
                                                <div className="p-1">
                                                    {sortOptions.map((option) => (
                                                        <Menu.Item key={option.id}>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => setSortType(option.id)}
                                                                    className={`${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'} group flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium`}
                                                                >
                                                                    {option.name}
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center space-x-3 mr-6 animate-in slide-in-from-top-2 duration-300">
                                    <span className="text-sm font-bold text-gray-500 mr-2">
                                        <span className="text-blue-600">{selectedIds.length}</span> Selected
                                    </span>
                                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-lg">
                                        <button
                                            onClick={() => handleBulkAction('edit')}
                                            className="h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-slate-800"
                                            title="Edit"
                                        >
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('delete')}
                                            className="h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-gray-100 dark:border-slate-800"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('view')}
                                            className="h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-slate-800"
                                            title="View"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('assign')}
                                            className="h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-slate-800"
                                            title="Assign"
                                        >
                                            <UserIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('follow_up')}
                                            className="h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-slate-800"
                                            title="Follow-up"
                                        >
                                            <ArrowPathIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-gray-200 dark:border-slate-800 shadow-sm mr-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Quick search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-transparent border-none text-xs focus:ring-0 w-48 pl-9 py-1.5 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <Button variant="primary" size="sm" onClick={() => router.push('/leads/new')} className="px-5 font-bold shadow-lg shadow-blue-500/20">
                                <PlusIcon className="h-4 w-4 mr-1.5 stroke-[3]" />
                                Add lead
                            </Button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-x-auto lg:overflow-x-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                        <DataTable
                            columns={columns}
                            data={paginatedLeads}
                            selectable
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            onRowClick={(lead) => {
                                setSelectedLead(lead);
                                setIsDetailOpen(true);
                            }}
                        />
                    </div>

                    {/* Pagination Section */}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 px-4 flex-shrink-0">
                        <div className="font-medium tracking-tight">
                            {filteredLeads.length > 0 ? (
                                <>Showing <span className="text-gray-900 dark:text-white font-bold">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredLeads.length)}</span> of <span className="text-gray-900 dark:text-white font-bold">{filteredLeads.length}</span> leads</>
                            ) : 'No leads found'}
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="text-lg leading-none">&laquo;</span>
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all font-bold ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 transform scale-105'
                                                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="text-lg leading-none">&raquo;</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Panels & Dialogs */}
            <LeadDetailPanel
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                lead={selectedLead}
                onEdit={(lead) => {
                    setLeadToUpdate(lead);
                }}
            />

            {callLead && (
                <LeadCallDialog
                    isOpen={!!callLead}
                    onClose={() => setCallLead(null)}
                    lead={callLead}
                />
            )}

            {emailLead && (
                <LeadEmailDialog
                    isOpen={!!emailLead}
                    onClose={() => setEmailLead(null)}
                    lead={emailLead}
                />
            )}

            {leadToAssign && (
                <LeadAssignDialog
                    isOpen={!!leadToAssign}
                    onClose={() => setLeadToAssign(null)}
                    leadIds={Array.isArray(leadToAssign) ? leadToAssign : [leadToAssign.id]}
                    leadName={!Array.isArray(leadToAssign) ? (leadToAssign.first_name || leadToAssign.title) : undefined}
                    onSuccess={() => {
                        fetchLeads();
                        setSelectedIds([]);
                    }}
                />
            )}

            {leadForPriority && (
                <LeadPriorityDialog
                    isOpen={!!leadForPriority}
                    onClose={() => setLeadForPriority(null)}
                    lead={leadForPriority}
                    onSuccess={fetchLeads}
                />
            )}

            {leadForFollowUp && (
                <LeadFollowUpDialog
                    isOpen={!!leadForFollowUp}
                    onClose={() => setLeadForFollowUp(null)}
                    lead={leadForFollowUp}
                    onSuccess={fetchLeads}
                />
            )}

            {leadToUpdate && (
                <LeadUpdateDialog
                    isOpen={!!leadToUpdate}
                    onClose={() => setLeadToUpdate(null)}
                    lead={leadToUpdate}
                    onSuccess={fetchLeads}
                />
            )}
        </DashboardLayout>
    );
}
