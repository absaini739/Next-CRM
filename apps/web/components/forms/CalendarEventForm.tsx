import { useState } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CalendarEventFormProps {
    event?: any;
    selectedDate?: Date;
    onClose: () => void;
    onSuccess: () => void;
}

const EVENT_TYPES = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'call', label: 'Call' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'personal', label: 'Personal' },
];

export default function CalendarEventForm({ event, selectedDate, onClose, onSuccess }: CalendarEventFormProps) {
    const [loading, setLoading] = useState(false);

    const getDefaultStartDate = () => {
        if (event?.start_date) return event.start_date.split('T')[0];
        if (selectedDate) return selectedDate.toISOString().split('T')[0];
        return new Date().toISOString().split('T')[0];
    };

    const getDefaultEndDate = () => {
        if (event?.end_date) return event.end_date.split('T')[0];
        if (selectedDate) return selectedDate.toISOString().split('T')[0];
        return new Date().toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        event_type: event?.event_type || 'meeting',
        start_date: getDefaultStartDate(),
        start_time: event?.start_date ? new Date(event.start_date).toTimeString().slice(0, 5) : '09:00',
        end_date: getDefaultEndDate(),
        end_time: event?.end_date ? new Date(event.end_date).toTimeString().slice(0, 5) : '10:00',
        all_day: event?.all_day || false,
        location: event?.location || '',
        person_id: event?.person_id || '',
        organization_id: event?.organization_id || '',
        lead_id: event?.lead_id || '',
        deal_id: event?.deal_id || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                start_date: `${formData.start_date}T${formData.start_time}:00Z`,
                end_date: `${formData.end_date}T${formData.end_time}:00Z`,
                person_id: formData.person_id ? parseInt(formData.person_id) : undefined,
                organization_id: formData.organization_id ? parseInt(formData.organization_id) : undefined,
                lead_id: formData.lead_id ? parseInt(formData.lead_id) : undefined,
                deal_id: formData.deal_id ? parseInt(formData.deal_id) : undefined,
            };

            if (event) {
                await api.put(`/calendar/events/${event.id}`, payload);
                toast.success('Event updated successfully');
            } else {
                await api.post('/calendar/events', payload);
                toast.success('Event created successfully');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold">
                        {event ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter event title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter event description"
                        />
                    </div>

                    {/* Event Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Type *
                        </label>
                        <select
                            required
                            value={formData.event_type}
                            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {EVENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* All Day Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="all_day"
                            checked={formData.all_day}
                            onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="all_day" className="ml-2 block text-sm text-gray-700">
                            All day event
                        </label>
                    </div>

                    {/* Start Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {!formData.all_day && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* End Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {!formData.all_day && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter location or meeting link"
                        />
                    </div>

                    {/* CRM Relations (Optional) */}
                    <div className="border-t pt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Link to CRM Entity (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Person ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.person_id}
                                    onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Person ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Organization ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.organization_id}
                                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Organization ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lead ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.lead_id}
                                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lead ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deal ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.deal_id}
                                    onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Deal ID"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
