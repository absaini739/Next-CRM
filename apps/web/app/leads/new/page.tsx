'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeftIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export default function NewLeadPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [persons, setPersons] = useState([]);
    const [users, setUsers] = useState([]);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        first_name: '',
        last_name: '',
        company_name: '',
        job_title: '',
        website: '',
        linkedin_url: '',
        location: '',
        primary_email: '',
        secondary_email: '',
        phone: '',
        mobile: '',
        lead_rating: '3',
        no_employees: '',
        lead_value: '',
        stage_id: '1',
        person_id: '',
        lead_source_id: '1',
        lead_type_id: '1',
        user_id: '',
        assigned_to_id: '',
    });

    useEffect(() => {
        fetchPersons();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, user_id: user.id.toString() }));
        }
    }, [user]);

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error('Failed to load persons');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                stage_id: parseInt(formData.stage_id),
                lead_source_id: parseInt(formData.lead_source_id),
                lead_type_id: parseInt(formData.lead_type_id),
                person_id: formData.person_id ? parseInt(formData.person_id) : undefined,
                lead_value: formData.lead_value ? parseFloat(formData.lead_value) : undefined,
                user_id: formData.user_id ? parseInt(formData.user_id) : undefined,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : undefined,
            };

            await api.post('/leads', payload);
            toast.success('Lead created successfully');
            router.push('/leads');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create lead');
        } finally {
            setLoading(false);
        }
    };

    // Helper for compact inputs
    const compactClass = "py-1 text-sm";

    return (
        <DashboardLayout>
            {/* 
               Overlap Fix Logic:
               - Removed -mt-14 which was causing overlap with the navbar.
               - Used -mx-6 -mb-6 to reclaim space from DashboardLayout's p-6 padding on sides and bottom only.
               - Used mt-[-1rem] to slightly pull up without hitting header (safe zone).
               - Adjusted height to fit viewport: h-[calc(100%+1.5rem)] covers the bottom padding reclaiming.
            */}
            <div className="h-[calc(100%+1.5rem)] -mx-6 -mb-6 mt-[-1rem] flex flex-col overflow-hidden">
                <div className="w-full h-full flex flex-col px-6 pb-6">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => router.back()}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Lead</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 pb-1">
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg rounded-xl flex-1 flex flex-col overflow-hidden">

                            {/* 
                                Form Layout:
                                - Removed pt-10 to gain back some space since we aren't pulling up as much.
                                - Added content-center to keep efficient vertical distribution.
                            */}
                            {/* Changed shrink-0 to flex-1 to allow vertical centering */}
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-600 flex-1 content-center">

                                {/* Row 1: Primary Deal Info */}
                                <div className="lg:col-span-2">
                                    <Input
                                        label="Opportunity Title"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enterprise License Q1"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Deal Value ($)"
                                        type="number"
                                        step="0.01"
                                        value={formData.lead_value}
                                        onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
                                        placeholder="0.00"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Select
                                        label="Status"
                                        value={formData.stage_id}
                                        onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                                        options={[
                                            { value: '1', label: 'New' },
                                            { value: '2', label: 'Follow Up' },
                                            { value: '3', label: 'Prospect' },
                                            { value: '4', label: 'Negotiation' },
                                            { value: '5', label: 'Won' },
                                        ]}
                                        className={compactClass}
                                    />
                                </div>

                                {/* Row 2: Person Info */}
                                <div className="lg:col-span-1">
                                    <Input
                                        label="First Name"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        placeholder="John"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Last Name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        placeholder="Doe"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Job Title"
                                        value={formData.job_title}
                                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                        placeholder="CTO"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Select
                                        label="Lead Owner"
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                        options={[
                                            { value: '', label: 'Select' },
                                            ...users.map((u: any) => ({ value: u.id, label: u.name })),
                                        ]}
                                        className={compactClass}
                                    />
                                </div>

                                {/* Row 3: Contact Info */}
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Primary Email"
                                        type="email"
                                        value={formData.primary_email}
                                        onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                                        placeholder="email@example.com"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Mobile"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        placeholder="+1 234..."
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Work Phone"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="City, Country"
                                        className={compactClass}
                                    />
                                </div>

                                {/* Row 4: Company & Assignment */}
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Company"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        placeholder="Acme Inc."
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Website"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="acme.com"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Employees"
                                        value={formData.no_employees}
                                        onChange={(e) => setFormData({ ...formData, no_employees: e.target.value })}
                                        placeholder="50-100"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Select
                                        label="Assigned To"
                                        value={formData.assigned_to_id}
                                        onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                        options={[
                                            { value: '', label: 'Unassigned' },
                                            ...users.map((u: any) => ({ value: u.id, label: u.name })),
                                        ]}
                                        className={compactClass}
                                    />
                                </div>

                                {/* Row 5: Additional Info */}
                                <div className="lg:col-span-1">
                                    <Input
                                        label="LinkedIn"
                                        value={formData.linkedin_url}
                                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        placeholder="linkedin.com/in/..."
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Secondary Email"
                                        value={formData.secondary_email}
                                        onChange={(e) => setFormData({ ...formData, secondary_email: e.target.value })}
                                        placeholder="other@email.com"
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <Select
                                        label="Existing Contact"
                                        value={formData.person_id}
                                        onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                        options={[
                                            { value: '', label: 'Create New' },
                                            ...persons.map((p: any) => ({ value: p.id, label: p.name })),
                                        ]}
                                        className={compactClass}
                                    />
                                </div>
                                <div className="lg:col-span-1 flex flex-col justify-end pb-1">
                                    <div className="flex items-center space-x-1 h-full pt-4">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-2">Rating:</span>
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, lead_rating: rating.toString() })}
                                                onMouseEnter={() => setHoverRating(rating)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none"
                                            >
                                                <StarIcon
                                                    className={`h-5 w-5 transition-colors ${(hoverRating || parseInt(formData.lead_rating || '0')) >= rating
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Full Width Description */}
                                <div className="lg:col-span-4 mt-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        rows={2}
                                        placeholder="Additional context..."
                                    />
                                </div>
                            </div>

                            {/* Footer - Slightly Increased Padding for visual balance */}
                            <div className="px-5 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-slate-700 shrink-0">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                    className="bg-transparent dark:text-white border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 py-1 px-4 text-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                    className="py-1 px-4 text-sm"
                                >
                                    {loading ? 'Creating...' : 'Create Lead'}
                                </Button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
