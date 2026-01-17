'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface LeadsFilterSidebarProps {
    onClose: () => void;
}

export default function LeadsFilterSidebar({ onClose }: LeadsFilterSidebarProps) {
    return (
        <aside className="w-80 border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden transition-all duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Filter</h2>
                <div className="flex items-center space-x-2">
                    <button className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline">Clear Filter</button>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Date Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-tight">Date</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Start Date" className="text-xs p-2 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-white" />
                        <input type="text" placeholder="End Date" className="text-xs p-2 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-tight">Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {['New Lead', 'Follow Up', 'Hot Lead', 'Lost Lead'].map(status => (
                            <label key={status} className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                                <span className="text-xs text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-200">{status}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Company Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-tight">Company</h3>
                    <select className="w-full text-xs p-2 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Please select</option>
                    </select>
                </div>

                {/* Lead Score Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-tight">Lead Score</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="Min" className="text-xs p-2 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-white" />
                        <input type="number" placeholder="Max" className="text-xs p-2 border border-gray-200 dark:border-slate-700 rounded bg-transparent text-gray-900 dark:text-white" />
                    </div>
                </div>

                {/* Tags Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-tight">Tags</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                        {['Logistics', 'Management', 'Marketing', 'Finance', 'Banking', 'Investing'].map(tag => (
                            <label key={tag} className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                                <span className="text-xs text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-200">{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
                <Button variant="primary" className="w-full" size="md">
                    Result 75
                </Button>
            </div>
        </aside>
    );
}
