'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadsByStagesChartProps {
    data: Array<{ stage: string; count: number }>;
}

export default function LeadsByStagesChart({ data }: LeadsByStagesChartProps) {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2684FF" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
