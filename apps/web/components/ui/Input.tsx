import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-900 dark:text-slate-200 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-3 py-2 border rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-slate-400
            bg-white dark:bg-slate-800
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}
            ${className}
          `}
                    autoComplete="off"
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
