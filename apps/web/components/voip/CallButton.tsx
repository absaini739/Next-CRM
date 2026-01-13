import { PhoneIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { toast } from 'sonner';
import callManager from '@/lib/voip/callManager';

interface CallButtonProps {
    phoneNumber: string;
    contactName?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'ghost';
}

export default function CallButton({
    phoneNumber,
    contactName,
    size = 'md',
    variant = 'primary'
}: CallButtonProps) {
    const [calling, setCalling] = useState(false);

    const handleCall = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            setCalling(true);
            await callManager.makeCall(phoneNumber);
        } catch (error: any) {
            toast.error(error.message || 'Failed to make call');
        } finally {
            setCalling(false);
        }
    };

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const variantClasses = {
        primary: 'bg-green-600 hover:bg-green-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
        ghost: 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300',
    };

    return (
        <button
            onClick={handleCall}
            disabled={calling}
            className={`
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                rounded-full
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
                flex items-center justify-center
            `}
            title={`Call ${contactName || phoneNumber}`}
        >
            <PhoneIcon className={`${iconSizes[size]} ${calling ? 'animate-pulse' : ''}`} />
        </button>
    );
}
