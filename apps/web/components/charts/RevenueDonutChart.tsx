'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RevenueDonutChartProps {
    data: Array<{ name: string; value: number }>;
    title: string;
}

const COLORS = ['#2684FF', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RevenueDonutChart({ data, title }: RevenueDonutChartProps) {
    return (
        <div className="h-64">
            <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${Number(value || 0).toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
