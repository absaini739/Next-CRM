'use client';

import { useDroppable } from '@dnd-kit/core';
import { PlusIcon } from '@heroicons/react/24/outline';
import SortableLeadCard from './SortableLeadCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo } from 'react';

interface Props {
    stage: {
        id: string;
        name: string;
        color: string;
    };
    leads: any[];
    totalValue: number;
    onAddLead: () => void;
}

export default function StageColumn({ stage, leads, totalValue, onAddLead }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: `stage-${stage.id}`, // Prefix ID
        data: {
            type: 'Stage',
            stage,
        },
    });

    // Memoize IDs to prevent unnecessary calculations and ensure SortableContext stability
    const leadIds = useMemo(() => leads.map(l => `lead-${l.id}`), [leads]);

    return (
        <div
            ref={setNodeRef}
            className={`rounded-lg border overflow-hidden flex flex-col h-full max-h-[calc(100vh-12rem)]
        ${isOver ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'} 
      `}
        >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                            {stage.name} ({leads.length})
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            ${totalValue.toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={onAddLead}
                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className={`h-1 ${stage.color} rounded-full`}></div>
            </div>

            {/* Column Content */}
            <div
                className="p-4 space-y-3 flex-1 overflow-y-auto"
            >
                <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <SortableLeadCard key={lead.id} lead={lead} />
                    ))}
                </SortableContext>

                {leads.length === 0 && (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-slate-600 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-lg min-h-[100px]">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
