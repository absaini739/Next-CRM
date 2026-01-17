'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface LeadPriorityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    onSuccess?: () => void;
}

export default function LeadPriorityDialog({ isOpen, onClose, lead, onSuccess }: LeadPriorityDialogProps) {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(lead?.lead_rating || 'Medium');

    const ratings = ['Low', 'Medium', 'High'];

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await api.put(`/leads/${lead.id}`, {
                lead_rating: rating
            });
            toast.success(`Priority updated to ${rating}`);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update priority');
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <div className="px-4 py-5 sm:px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600">
                                            <StarIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                                                Lead Priority
                                            </Dialog.Title>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Update rating for <span className="font-semibold">{lead?.first_name || lead?.title}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="px-4 py-8 sm:px-6">
                                    <div className="flex justify-center space-x-4">
                                        {ratings.map((r, index) => {
                                            const isSelected = rating === r;
                                            return (
                                                <button
                                                    key={r}
                                                    onClick={() => setRating(r)}
                                                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isSelected
                                                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 scale-110 shadow-lg'
                                                            : 'border-gray-100 dark:border-slate-800 hover:border-yellow-200'
                                                        }`}
                                                >
                                                    {isSelected ? (
                                                        <StarIconSolid className="h-10 w-10 text-yellow-500 mb-2" />
                                                    ) : (
                                                        <StarIcon className="h-10 w-10 text-gray-300 dark:text-slate-700 mb-2" />
                                                    )}
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-yellow-700 dark:text-yellow-500' : 'text-gray-500'}`}>
                                                        {r}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                                    <Button variant="secondary" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        loading={loading}
                                        className="bg-yellow-500 hover:bg-yellow-600 border-none px-8"
                                    >
                                        Update
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
