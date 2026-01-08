'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    pointerWithin,
    rectIntersection,
    CollisionDetection,
} from '@dnd-kit/core';
import StageColumn from '@/components/leads/StageColumn';
import SortableLeadCard from '@/components/leads/SortableLeadCard';

const STAGES = [
    { id: '1', name: 'New', color: 'bg-blue-500' },
    { id: '2', name: 'Follow Up', color: 'bg-yellow-500' },
    { id: '3', name: 'Prospect', color: 'bg-orange-500' },
    { id: '4', name: 'Negotiation', color: 'bg-purple-500' },
    { id: '5', name: 'Won', color: 'bg-green-500' },
];

export default function LeadsPage() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLead, setActiveLead] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Keep track of the original state for revert on error
    const [originalLeads, setOriginalLeads] = useState<any[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            setLeads(response.data);
            setOriginalLeads(response.data);
        } catch (error) {
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        // Strip 'lead-' prefix
        const activeId = active.id.toString().replace('lead-', '');
        const lead = leads.find((l) => l.id.toString() === activeId);

        if (lead) {
            setActiveLead(lead);
            setOriginalLeads([...leads]);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id.toString().replace('lead-', '');
        const overId = over.id.toString();

        // 1. Find the active lead
        const activeLead = leads.find(l => l.id.toString() === activeId);
        if (!activeLead) return;

        const currentStageId = (activeLead.stage_id || 1).toString();
        let nextStageId = currentStageId;

        // 2. Detect what we are over
        const isOverStage = overId.startsWith('stage-');

        if (isOverStage) {
            // Over a stage column
            nextStageId = overId.replace('stage-', '');
        } else if (overId.startsWith('lead-')) {
            // Over another lead card
            const overLeadId = overId.replace('lead-', '');
            const overLead = leads.find(l => l.id.toString() === overLeadId);
            if (overLead) {
                nextStageId = (overLead.stage_id || 1).toString();
            }
        }

        if (currentStageId !== nextStageId) {
            setLeads((items) => {
                return items.map(item => {
                    if (item.id === activeLead.id) {
                        return { ...item, stage_id: parseInt(nextStageId) };
                    }
                    return item;
                });
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active } = event;
        setActiveLead(null);

        const activeId = active.id.toString().replace('lead-', '');
        const activeLead = leads.find(l => l.id.toString() === activeId);
        if (!activeLead) return;

        const newStageId = activeLead.stage_id || 1;
        const originalLead = originalLeads.find(l => l.id === activeLead.id);
        const originalStageId = originalLead?.stage_id || 1;

        if (newStageId !== originalStageId) {
            try {
                // API Call
                console.log('Updating lead to stage:', newStageId);
                await api.put(`/leads/${activeLead.id}`, { stage_id: newStageId });

                if (newStageId === 5) {
                    toast.success('Lead won! Converting to Deal...');
                    setTimeout(() => fetchLeads(), 1500);
                } else {
                    toast.success('Lead moved successfully');
                }

                // Update stable state
                setOriginalLeads(leads);

            } catch (error) {
                console.error(error);
                toast.error('Failed to move lead');
                setLeads(originalLeads); // Revert
            }
        }
    };

    const customCollisionDetection: CollisionDetection = useCallback(
        (args) => {
            const pointerCollisions = pointerWithin(args);
            if (pointerCollisions.length > 0) return pointerCollisions;
            return rectIntersection(args);
        },
        []
    );

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const groupedLeads = STAGES.reduce((acc, stage) => {
        acc[stage.id] = leads.filter(l => {
            const leadStageId = (l.stage_id || 1).toString();
            const matchesStage = leadStageId === stage.id;
            const matchesSearch = searchTerm === '' || (l.title && l.title.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesStage && matchesSearch;
        });
        return acc;
    }, {} as Record<string, any[]>);

    const calculateStageValue = (stageLeads: any[]) => {
        return stageLeads.reduce((sum, lead) => sum + (parseFloat(lead.lead_value) || 0), 0);
    };

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
            <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Leads</h1>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/leads/new')}
                        className="flex items-center"
                    >
                        Create Lead
                    </Button>
                </div>

                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by Title"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 rounded-lg"
                            />
                        </div>
                        <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center text-gray-700 dark:text-slate-200">
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            Filter
                        </button>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={customCollisionDetection}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 overflow-x-auto">
                        <div className="flex gap-4 h-full min-w-max pb-4">
                            {STAGES.map((stage) => {
                                const stageLeads = groupedLeads[stage.id] || [];
                                const stageValue = calculateStageValue(stageLeads);

                                return (
                                    <div key={stage.id} className="w-64 h-full shrink-0">
                                        <StageColumn
                                            stage={stage}
                                            leads={stageLeads}
                                            totalValue={stageValue}
                                            onAddLead={() => router.push('/leads/new')}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeLead ? (
                            <SortableLeadCard lead={activeLead} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </DashboardLayout>
    );
}
