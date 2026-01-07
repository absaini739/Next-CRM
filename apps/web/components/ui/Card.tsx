import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    action?: ReactNode;
    onClick?: () => void;
}

export default function Card({ children, className = '', title, action, onClick }: CardProps) {
    return (
        <div
            className={`bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-xl transition-all duration-200 ${className}`}
            onClick={onClick}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6 text-gray-700 dark:text-slate-200">{children}</div>
        </div>
    );
}
