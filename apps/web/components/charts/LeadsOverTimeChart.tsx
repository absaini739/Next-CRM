'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadsOverTimeChartProps {
    data: Array<{ month: string; count: number }>;
}

export default function LeadsOverTimeChart({ data }: LeadsOverTimeChartProps) {
    // Format month for display
    const formattedData = data.map(item => ({
        ...item,
        monthLabel: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2684FF" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
