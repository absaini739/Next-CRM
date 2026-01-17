'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface LeadAssignDialogProps {
    isOpen: boolean;
    onClose: () => void;
    leadIds: number[];
    leadName?: string; // For single lead display
    onSuccess?: () => void;
}

export default function LeadAssignDialog({ isOpen, onClose, leadIds, leadName, onSuccess }: LeadAssignDialogProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSelectedUserId('');
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleAssign = async () => {
        if (!selectedUserId) {
            toast.error('Please select a user');
            return;
        }

        setLoading(true);
        try {
            if (leadIds.length === 1) {
                await api.put(`/leads/${leadIds[0]}`, {
                    assigned_to_id: selectedUserId
                });
            } else {
                await api.patch('/leads/bulk', {
                    ids: leadIds,
                    data: { assigned_to_id: selectedUserId }
                });
            }
            toast.success(`${leadIds.length > 1 ? `${leadIds.length} leads` : 'Lead'} assigned successfully`);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign lead');
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="px-4 py-5 sm:px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                            <UserIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                                                {leadIds.length > 1 ? `Bulk Assign Leads` : 'Assign Lead'}
                                            </Dialog.Title>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                {leadIds.length > 1
                                                    ? `Reassign ${leadIds.length} selected leads to a team member`
                                                    : `Reassign ${leadName || 'lead'} to a team member`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="px-4 py-6 sm:px-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                            Select User
                                        </label>
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : '')}
                                            className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        >
                                            <option value="">Select a user...</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end space-x-3">
                                    <Button variant="secondary" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleAssign}
                                        disabled={loading || !selectedUserId}
                                        loading={loading}
                                    >
                                        Assign Lead
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
