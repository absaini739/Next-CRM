'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, UserIcon, BuildingOfficeIcon, GlobeAltIcon, EnvelopeIcon, PhoneIcon, StarIcon, ChartBarIcon, DocumentTextIcon, ArrowLeftIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
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
        user_id: '', // Lead Owner
        assigned_to_id: '', // Assigned To
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
            console.log('Fetched users:', response.data);
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

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create High-Value Lead</h1>
                            <p className="text-gray-500 mt-1">Nurture your sales pipeline with detailed intelligence.</p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            New Opportunity
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Content Area - Glassmorphism Card */}
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden">
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                                {/* Section 1: Core Identification */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                                            <UserIcon className="h-5 w-5 text-blue-600" />
                                            <h2 className="text-xl font-semibold text-gray-800 uppercase tracking-wider text-sm">Lead & Contact Details</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-1 md:col-span-2">
                                                <Input
                                                    label="Opportunity Title"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="e.g. Enterprise Software Suite License - Q1"
                                                    className="text-lg font-medium"
                                                />
                                            </div>
                                            <Input
                                                label="Estimated Deal Value ($)"
                                                type="number"
                                                step="0.01"
                                                value={formData.lead_value}
                                                onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
                                                placeholder="0.00"
                                            />
                                            <Select
                                                label="Link to Global Contact"
                                                value={formData.person_id}
                                                onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Create New Entry' },
                                                    ...persons.map((p: any) => ({ value: p.id, label: p.name })),
                                                ]}
                                            />
                                            <Input
                                                label="First Name"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                placeholder="Primary contact's name"
                                            />
                                            <Input
                                                label="Last Name"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                placeholder="Surname"
                                            />
                                            <Input
                                                label="Job Title"
                                                value={formData.job_title}
                                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                                placeholder="e.g. CTO / Head of Procurement"
                                            />
                                            <Select
                                                label="Lead Owner"
                                                value={formData.user_id}
                                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Select Owner' },
                                                    ...users.map((u: any) => ({ value: u.id, label: u.name })),
                                                ]}
                                            />
                                            <Select
                                                label="Assigned To"
                                                value={formData.assigned_to_id}
                                                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Unassigned' },
                                                    ...users.map((u: any) => ({ value: u.id, label: u.name })),
                                                ]}
                                            />
                                            <Select
                                                label="Lead Status"
                                                value={formData.stage_id}
                                                onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                                                options={[
                                                    { value: '1', label: 'New' },
                                                    { value: '2', label: 'Follow Up' },
                                                    { value: '3', label: 'Prospect' },
                                                    { value: '4', label: 'Negotiation' },
                                                    { value: '5', label: 'Won' },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    {/* Section 2: Company Details */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                                            <BuildingOfficeIcon className="h-5 w-5 text-emerald-600" />
                                            <h2 className="text-xl font-semibold text-gray-800 uppercase tracking-wider text-sm">Company Details</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Company Name"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                placeholder="Company legal name"
                                            />
                                            <Input
                                                label="Website Link"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="www.acme.com"
                                            />
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-700">Lead Rating</label>
                                                <div className="flex items-center space-x-1">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <button
                                                            key={rating}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, lead_rating: rating.toString() })}
                                                            onMouseEnter={() => setHoverRating(rating)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                                                        >
                                                            <StarIcon
                                                                className={`h-8 w-8 transition-colors ${(hoverRating || parseInt(formData.lead_rating || '0')) >= rating
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                    <span className="ml-2 text-sm text-gray-500 font-medium">
                                                        {formData.lead_rating ? `${formData.lead_rating} Star${formData.lead_rating !== '1' ? 's' : ''}` : 'Rate Impact'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Input
                                                label="No. of Employees"
                                                value={formData.no_employees}
                                                onChange={(e) => setFormData({ ...formData, no_employees: e.target.value })}
                                                placeholder="e.g. 50-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Column: Contact Info & Logistics */}
                                <div className="lg:col-span-1 space-y-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                            <PhoneIcon className="h-5 w-5 text-amber-600" />
                                            <h2 className="text-xl font-semibold text-gray-800 uppercase tracking-wider text-sm">Contact Info</h2>
                                        </div>
                                        <Input
                                            label="Primary Email"
                                            type="email"
                                            value={formData.primary_email}
                                            onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                                            placeholder="primary@email.com"
                                        />
                                        <Input
                                            label="Secondary Email"
                                            type="email"
                                            value={formData.secondary_email}
                                            onChange={(e) => setFormData({ ...formData, secondary_email: e.target.value })}
                                            placeholder="secondary@email.com"
                                        />
                                        <Input
                                            label="Phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Work Phone"
                                        />
                                        <Input
                                            label="Mobile"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="Mobile Phone"
                                        />
                                        <Input
                                            label="LinkedIn URL"
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                            placeholder="linkedin.com/in/..."
                                        />
                                        <Input
                                            label="Location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Wide Full Width Sections */}
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="space-y-4">
                                    <label className="flex items-center text-sm font-semibold text-gray-700">
                                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                                        Description & Notes
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
                                        rows={4}
                                        placeholder="Add any additional context, requirements, or notes..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions Footer */}
                        <div className="bg-gray-50/80 px-8 py-6 flex items-center justify-between border-t border-gray-100">
                            <p className="text-sm text-gray-500 italic">
                                * Lead Owner defaults to you. Status defaults to New.
                            </p>
                            <div className="flex space-x-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                    className="px-8 bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                    className="px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? 'Processing...' : 'Create Lead'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
