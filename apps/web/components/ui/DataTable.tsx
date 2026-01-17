'use client';

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onRowClick?: (row: any) => void;
    selectable?: boolean;
    selectedIds?: (string | number)[];
    onSelectionChange?: (ids: (string | number)[]) => void;
    idKey?: string;
}

export default function DataTable({ columns, data, onRowClick, selectable, selectedIds = [], onSelectionChange, idKey = 'id' }: DataTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const sortedData = React.useMemo(() => {
        if (!sortConfig) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleAll = () => {
        if (selectedIds.length === data.length) {
            onSelectionChange?.([]);
        } else {
            onSelectionChange?.(data.map(item => item[idKey]));
        }
    };

    const toggleRow = (id: string | number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange?.(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange?.([...selectedIds, id]);
        }
    };

    return (
        <div className="overflow-x-auto lg:overflow-x-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 table-fixed lg:table-auto">
                <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                        {selectable && (
                            <th className="px-3 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={data.length > 0 && selectedIds.length === data.length}
                                    onChange={toggleAll}
                                />
                            </th>
                        )}
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-3 py-3 text-left text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700' : ''
                                    }`}
                                style={column.width ? { width: column.width } : {}}
                                onClick={() => column.sortable && requestSort(column.key)}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>{column.label}</span>
                                    {column.sortable && sortConfig?.key === column.key && (
                                        <>
                                            {sortConfig.direction === 'asc' ? (
                                                <ChevronUpIcon className="h-4 w-4" />
                                            ) : (
                                                <ChevronDownIcon className="h-4 w-4" />
                                            )}
                                        </>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {sortedData.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors' : ''} ${selectedIds.includes(row[idKey]) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            onClick={() => onRowClick?.(row)}
                        >
                            {selectable && (
                                <td className="px-3 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={selectedIds.includes(row[idKey])}
                                        onChange={() => toggleRow(row[idKey])}
                                    />
                                </td>
                            )}
                            {columns.map((column) => (
                                <td key={column.key} className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100" style={column.width ? { width: column.width, overflow: 'hidden', textOverflow: 'ellipsis' } : {}}>
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                    No data available
                </div>
            )}
        </div>
    );
}
