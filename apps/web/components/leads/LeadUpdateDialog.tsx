'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/lib/api';
import { toast } from 'sonner';

interface LeadUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any | null;
    onSuccess: () => void;
}

const StarRating = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    return (
        <div className="flex items-center space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    {star <= value ? (
                        <StarSolid className="h-5 w-5 text-yellow-400" />
                    ) : (
                        <StarOutline className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default function LeadUpdateDialog({ isOpen, onClose, lead, onSuccess }: LeadUpdateDialogProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [stages, setStages] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({
        title: '',
        lead_value: '',
        stage_id: '',
        first_name: '',
        last_name: '',
        job_title: '',
        user_id: '',
        primary_email: '',
        mobile: '',
        phone: '',
        location: '',
        company_name: '',
        website: '',
        no_employees: '',
        assigned_to_id: '',
        linkedin_url: '',
        secondary_email: '',
        lead_source_id: '',
        lead_rating_stars: 3,
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchMetadata();
            if (lead) {
                setFormData({
                    title: lead.title || '',
                    lead_value: lead.lead_value?.toString() || '',
                    stage_id: lead.stage_id?.toString() || '',
                    first_name: lead.first_name || '',
                    last_name: lead.last_name || '',
                    job_title: lead.job_title || '',
                    user_id: lead.user_id?.toString() || '',
                    primary_email: lead.primary_email || '',
                    mobile: lead.mobile || '',
                    phone: lead.phone || '',
                    location: lead.location || '',
                    company_name: lead.company_name || '',
                    website: lead.website || '',
                    no_employees: lead.no_employees || '',
                    assigned_to_id: lead.assigned_to_id?.toString() || '',
                    linkedin_url: lead.linkedin_url || '',
                    secondary_email: lead.secondary_email || '',
                    lead_source_id: lead.lead_source_id?.toString() || '',
                    lead_rating_stars: lead.lead_rating === 'Hot' ? 5 : lead.lead_rating === 'Warm' ? 3 : 1,
                    description: lead.description || ''
                });
            }
        }
    }, [isOpen, lead]);

    const fetchMetadata = async () => {
        try {
            const [usersRes, pipelinesRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/pipelines')
            ]);
            setUsers(usersRes.data);

            const defaultPipeline = pipelinesRes.data.find((p: any) => p.is_default) || pipelinesRes.data[0];
            if (defaultPipeline) {
                setStages(defaultPipeline.stages || []);
            }

            try {
                const sourcesRes = await api.get('/leads/sources');
                setSources(sourcesRes.data);
            } catch {
                setSources([
                    { id: 1, name: 'YouTube Interview' },
                    { id: 2, name: 'Google Ads' },
                    { id: 3, name: 'Referral' },
                    { id: 4, name: 'Website' }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const rating = formData.lead_rating_stars >= 4 ? 'Hot' : formData.lead_rating_stars >= 2 ? 'Warm' : 'Cold';
            const payload = {
                ...formData,
                lead_rating: rating,
                lead_source_id: formData.lead_source_id ? parseInt(formData.lead_source_id) : undefined,
                stage_id: formData.stage_id ? parseInt(formData.stage_id) : undefined,
                user_id: formData.user_id ? parseInt(formData.user_id) : undefined,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : undefined,
                lead_value: formData.lead_value ? parseFloat(formData.lead_value) : undefined
            };
            await api.put(`/leads/${lead.id}`, payload);
            toast.success('Lead updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update lead');
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
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-5xl border border-gray-200 dark:border-slate-800">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
                                        Update Lead
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-6">
                                        {/* Row 1: Title, Value, Status */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-2">
                                                <Input
                                                    label="Opportunity Title"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="Enterprise License Q1"
                                                />
                                            </div>
                                            <Input
                                                label="Deal Value ($)"
                                                type="number"
                                                step="0.01"
                                                value={formData.lead_value}
                                                onChange={(e) => setFormData({ ...formData, lead_value: e.target.value })}
                                                placeholder="0.00"
                                            />
                                            <Select
                                                label="Status"
                                                value={formData.stage_id}
                                                onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Select Status' },
                                                    ...stages.map(s => ({ value: s.id.toString(), label: s.name }))
                                                ]}
                                            />
                                        </div>

                                        {/* Row 2: Names, Job Title, Owner */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <Input
                                                label="First Name"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                placeholder="John"
                                            />
                                            <Input
                                                label="Last Name"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                placeholder="Doe"
                                            />
                                            <Input
                                                label="Job Title"
                                                value={formData.job_title}
                                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                                placeholder="CTO"
                                            />
                                            <Select
                                                label="Lead Owner"
                                                value={formData.user_id}
                                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Unassigned' },
                                                    ...users.map(u => ({ value: u.id.toString(), label: u.name || u.email }))
                                                ]}
                                            />
                                        </div>

                                        {/* Row 3: Contact Info */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <Input
                                                label="Primary Email"
                                                type="email"
                                                value={formData.primary_email}
                                                onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                            <Input
                                                label="Mobile"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                placeholder="+1 234..."
                                            />
                                            <Input
                                                label="Phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Work Phone"
                                            />
                                            <Input
                                                label="Location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="City, Country"
                                            />
                                        </div>

                                        {/* Row 4: Company Info */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <Input
                                                label="Company"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                placeholder="Acme Inc."
                                            />
                                            <Input
                                                label="Website"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="acme.com"
                                            />
                                            <Input
                                                label="Employees"
                                                value={formData.no_employees}
                                                onChange={(e) => setFormData({ ...formData, no_employees: e.target.value })}
                                                placeholder="50-100"
                                            />
                                            <Select
                                                label="Assigned To"
                                                value={formData.assigned_to_id}
                                                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Unassigned' },
                                                    ...users.map(u => ({ value: u.id.toString(), label: u.name || u.email }))
                                                ]}
                                            />
                                        </div>

                                        {/* Row 5: Extra Info & Rating */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <Input
                                                label="LinkedIn"
                                                value={formData.linkedin_url}
                                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                                placeholder="linkedin.com/in/..."
                                            />
                                            <Input
                                                label="Secondary Email"
                                                type="email"
                                                value={formData.secondary_email}
                                                onChange={(e) => setFormData({ ...formData, secondary_email: e.target.value })}
                                                placeholder="other@email.com"
                                            />
                                            <Select
                                                label="Source"
                                                value={formData.lead_source_id}
                                                onChange={(e) => setFormData({ ...formData, lead_source_id: e.target.value })}
                                                options={[
                                                    { value: '', label: 'Select Source' },
                                                    ...sources.map(s => ({ value: s.id.toString(), label: s.name }))
                                                ]}
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-slate-200 mb-1">
                                                    Rating
                                                </label>
                                                <StarRating
                                                    value={formData.lead_rating_stars}
                                                    onChange={(val) => setFormData({ ...formData, lead_rating_stars: val })}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 6: Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 dark:text-slate-200 mb-1">
                                                Notes
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Additional context..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={onClose}
                                            className="px-6"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={loading}
                                            className="px-8 shadow-lg shadow-blue-500/20"
                                        >
                                            Save Changes
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
