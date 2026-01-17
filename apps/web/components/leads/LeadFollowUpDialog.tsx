'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface LeadFollowUpDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    onSuccess?: () => void;
}

export default function LeadFollowUpDialog({ isOpen, onClose, lead, onSuccess }: LeadFollowUpDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: `Follow up with ${lead?.first_name || lead?.title}`,
        type: 'call',
        start_at: new Date().toISOString().slice(0, 16),
        description: ''
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/activities', {
                ...formData,
                lead_id: lead.id,
                start_at: new Date(formData.start_at).toISOString()
            });
            toast.success(`Follow-up scheduled`);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to schedule follow-up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                            <CalendarDaysIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                                                Schedule Follow-up
                                            </Dialog.Title>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Set a reminder for <span className="font-semibold">{lead?.first_name || lead?.title}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate}>
                                    <div className="px-6 py-6 space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                                Activity Type
                                            </label>
                                            <select
                                                required
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            >
                                                <option value="call">Phone Call</option>
                                                <option value="meeting">Meeting</option>
                                                <option value="email">Email</option>
                                                <option value="task">General Task</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                                Date & Time
                                            </label>
                                            <div className="relative">
                                                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={formData.start_at}
                                                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                                    className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Call to discuss proposal"
                                                className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Add some details..."
                                                className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                                        <Button variant="secondary" type="button" onClick={onClose}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                            loading={loading}
                                            className="px-8"
                                        >
                                            Schedule
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
