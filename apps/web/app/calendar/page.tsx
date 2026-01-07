'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CalendarEventForm from '@/components/forms/CalendarEventForm';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    event_type: string;
    start_date: string;
    end_date: string;
    all_day: boolean;
    location?: string;
    task?: { id: number; title: string; status: string; priority: string };
}

interface Task {
    id: number;
    title: string;
    task_type: string;
    priority: string;
    status: string;
    due_date: string;
    due_time?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, viewMode]);

    const fetchCalendarData = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            const response = await api.get(`/calendar/month/${year}/${month}`);
            setEvents(response.data.events || []);
            setTasks(response.data.tasks || []);
        } catch (error) {
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getTasksForDate = (date: Date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.due_date);
            return taskDate.toDateString() === date.toDateString();
        });
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading calendar...</div>
                </div>
            </DashboardLayout>
        );
    }

    const days = getDaysInMonth(currentDate);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        {/* Breadcrumbs removed as requested */}
                        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            View and manage your schedule
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Event
                    </Button>
                </div>

                {/* Calendar Controls */}
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold">
                                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                Today
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('day')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Day
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Calendar Grid */}
                <Card className="p-6">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-px mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                        {days.map((date, index) => {
                            const dayTasks = date ? getTasksForDate(date) : [];
                            const dayEvents = date ? getEventsForDate(date) : [];
                            const hasItems = dayTasks.length > 0 || dayEvents.length > 0;

                            return (
                                <div
                                    key={index}
                                    className={`bg-white min-h-[120px] p-2 ${date ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'
                                        } ${isToday(date) ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => date && setSelectedDate(date)}
                                >
                                    {date && (
                                        <>
                                            <div className={`text-sm font-medium mb-2 ${isToday(date) ? 'text-blue-600' : 'text-gray-900'
                                                }`}>
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {dayTasks.slice(0, 2).map(task => (
                                                    <div
                                                        key={task.id}
                                                        className={`text-xs px-2 py-1 rounded truncate ${getPriorityColor(task.priority)}`}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))}
                                                {dayEvents.slice(0, 2).map(event => (
                                                    <div
                                                        key={event.id}
                                                        className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded truncate"
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                                {(dayTasks.length + dayEvents.length) > 2 && (
                                                    <div className="text-xs text-gray-500 px-2">
                                                        +{(dayTasks.length + dayEvents.length) - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Upcoming Tasks Sidebar */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{task.title}</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(task.due_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: task.due_time ? '2-digit' : undefined,
                                            minute: task.due_time ? '2-digit' : undefined
                                        })}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No upcoming tasks
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Calendar Event Form Modal */}
            {showCreateModal && (
                <CalendarEventForm
                    selectedDate={selectedDate || undefined}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedDate(null);
                    }}
                    onSuccess={() => {
                        fetchCalendarData();
                        setShowCreateModal(false);
                        setSelectedDate(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
