'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';

interface Props {
    lead: any;
}

export default function SortableLeadCard({ lead }: Props) {
    const router = useRouter();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `lead-${lead.id}`, // Prefix ID
        data: {
            type: 'Lead',
            lead,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => router.push(`/leads/${lead.id}`)}
            className="bg-white dark:bg-slate-700/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow touch-none"
        >
            <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-1 pointer-events-none">
                {lead.title}
            </h4>
            {lead.description && (
                <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-2 pointer-events-none">
                    {lead.description}
                </p>
            )}
            {lead.lead_value && (
                <p className="text-sm font-semibold text-blue-600 pointer-events-none">
                    ${parseFloat(lead.lead_value).toLocaleString()}
                </p>
            )}
        </div>
    );
}
