'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PersonsPage() {
    const router = useRouter();
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPersons();
    }, []);

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            toast.error('Failed to load persons');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
        },
        {
            key: 'emails',
            label: 'Email',
            render: (emails: any[]) => {
                if (!emails || emails.length === 0) return '-';
                const primary = emails.find(e => e.label === 'primary') || emails[0];
                return primary?.value || '-';
            },
        },
        {
            key: 'contact_numbers',
            label: 'Phone',
            render: (numbers: any[]) => {
                if (!numbers || numbers.length === 0) return '-';

                const phoneNumber = numbers.find(n => n.label === 'phone');
                const mobileNumber = numbers.find(n => n.label === 'mobile');

                // Fallback: get any unlabeled numbers or numbers with other labels
                const otherNumbers = numbers.filter(n => !n.label || (n.label !== 'phone' && n.label !== 'mobile'));

                return (
                    <div className="flex flex-col gap-1">
                        {phoneNumber && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-900">{phoneNumber.value}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/voip?dial=${encodeURIComponent(phoneNumber.value)}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Call this number"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {mobileNumber && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-900">{mobileNumber.value}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/voip?dial=${encodeURIComponent(mobileNumber.value)}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Call this number"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {/* Display any other/unlabeled numbers (for existing records) */}
                        {otherNumbers.map((num, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-gray-900">{num.value}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/voip?dial=${encodeURIComponent(num.value)}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Call this number"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Persons</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage your contacts and leads
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/persons/new')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Person
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <DataTable
                        columns={columns}
                        data={persons}
                        onRowClick={(person) => router.push(`/persons/${person.id}`)}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
}
