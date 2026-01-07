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
            className={`bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg ${className}`}
            onClick={onClick}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    {title && <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}
