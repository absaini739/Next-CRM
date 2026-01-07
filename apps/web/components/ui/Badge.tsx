interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    size?: 'sm' | 'md';
    className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
    const variants = {
        success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
        default: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
}
