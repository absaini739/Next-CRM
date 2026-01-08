'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CalendarEventForm from '@/components/forms/CalendarEventForm';
import TaskForm from '@/components/forms/TaskForm';
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
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, viewMode]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            let response;
            if (viewMode === 'month') {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                response = await api.get(`/calendar/month/${year}/${month}`);
            } else if (viewMode === 'week') {
                const year = currentDate.getFullYear();
                // Get ISO week number
                const firstDayOfYear = new Date(year, 0, 1);
                const pastDaysOfYear = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;
                const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                response = await api.get(`/calendar/week/${year}/${weekNum}`);
            } else {
                const dateStr = currentDate.toISOString().split('T')[0];
                response = await api.get(`/calendar/day/${dateStr}`);
            }

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

    const previous = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (viewMode === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 7);
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 1);
            setCurrentDate(newDate);
        }
    };

    const next = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (viewMode === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 7);
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 1);
            setCurrentDate(newDate);
        }
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
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading calendar...</div>
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
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
                                onClick={previous}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {viewMode === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
                                {viewMode === 'day' && currentDate.toLocaleDateString()}
                            </h2>
                            <button
                                onClick={next}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-900 dark:text-white"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            >
                                Today
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('day')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Day
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Calendar Grid */}
                <Card className="p-6">
                    {viewMode === 'month' && (
                        <>
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-px mb-2">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-slate-400 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700">
                                {days.map((date, index) => {
                                    const dayTasks = date ? getTasksForDate(date) : [];
                                    const dayEvents = date ? getEventsForDate(date) : [];

                                    return (
                                        <div
                                            key={index}
                                            className={`bg-white dark:bg-slate-800 min-h-[120px] p-2 ${date ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700' : 'bg-gray-50 dark:bg-slate-900'
                                                } ${isToday(date) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                                            onClick={() => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setShowTaskModal(true);
                                                }
                                            }}
                                        >
                                            {date && (
                                                <>
                                                    <div className={`text-sm font-medium mb-2 ${isToday(date) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                        {date.getDate()}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {dayTasks.slice(0, 2).map(task => (
                                                            <div
                                                                key={task.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTask(task);
                                                                    setShowTaskModal(true);
                                                                }}
                                                                className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${getPriorityColor(task.priority)}`}
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
                                                            <div className="text-xs text-gray-500 dark:text-slate-500 px-2">
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
                        </>
                    )}

                    {viewMode === 'week' && (
                        <div className="grid grid-cols-7 gap-px divide-x dark:divide-slate-700">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const date = new Date(currentDate);
                                date.setDate(currentDate.getDate() - currentDate.getDay() + i);
                                const dayTasks = getTasksForDate(date);
                                const dayEvents = getEventsForDate(date);

                                return (
                                    <div key={i} className="min-h-[400px] p-2 bg-white dark:bg-slate-800">
                                        <div className={`text-sm font-semibold mb-4 text-center ${isToday(date) ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                                            <div>{DAYS[i]}</div>
                                            <div className="text-xl">{date.getDate()}</div>
                                        </div>
                                        <div className="space-y-2">
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowTaskModal(true);
                                                    }}
                                                    className={`text-xs p-2 rounded shadow-sm cursor-pointer ${getPriorityColor(task.priority)}`}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                            {dayEvents.map(event => (
                                                <div key={event.id} className="text-xs p-2 bg-purple-100 text-purple-800 rounded shadow-sm">
                                                    {event.title}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    setShowTaskModal(true);
                                                }}
                                                className="w-full py-1 text-xs text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700 rounded border border-dashed border-gray-200 dark:border-slate-700"
                                            >
                                                + Add Task
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {viewMode === 'day' && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            <div className="flex items-center justify-between border-b pb-4">
                                <h3 className="text-xl font-bold">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setSelectedDate(currentDate);
                                        setShowTaskModal(true);
                                    }}
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add Task
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 dark:text-slate-300">Tasks</h4>
                                {getTasksForDate(currentDate).map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setShowTaskModal(true);
                                        }}
                                        className={`p-4 rounded-lg flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}
                                    >
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm opacity-75">{task.due_time || 'No time set'}</div>
                                    </div>
                                ))}
                                {getTasksForDate(currentDate).length === 0 && (
                                    <div className="text-center py-8 text-gray-500 italic">No tasks for today</div>
                                )}

                                <h4 className="font-semibold text-gray-700 dark:text-slate-300 mt-8">Events</h4>
                                {getEventsForDate(currentDate).map(event => (
                                    <div key={event.id} className="p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-900 dark:text-purple-100 rounded-lg flex items-center justify-between">
                                        <div className="font-medium">{event.title}</div>
                                        <div className="text-sm opacity-75">{new Date(event.start_date).toLocaleTimeString()}</div>
                                    </div>
                                ))}
                                {getEventsForDate(currentDate).length === 0 && (
                                    <div className="text-center py-8 text-gray-500 italic">No events for today</div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Upcoming Tasks Sidebar */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-slate-400">
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
                            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                                No upcoming tasks
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Task Form Modal */}
            {showTaskModal && (
                <TaskForm
                    task={selectedTask || undefined}
                    selectedDate={selectedDate || undefined}
                    onClose={() => {
                        setShowTaskModal(false);
                        setSelectedTask(null);
                        setSelectedDate(null);
                    }}
                    onSuccess={() => {
                        fetchCalendarData();
                        setShowTaskModal(false);
                        setSelectedTask(null);
                        setSelectedDate(null);
                    }}
                />
            )}

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
