import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-900 dark:text-slate-200 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
<<<<<<< HEAD
            w-full px-3 py-2 border rounded-lg shadow-sm text-black
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
=======
            w-full px-3 py-2 border rounded-lg shadow-sm text-gray-900 dark:text-white
            bg-white dark:bg-slate-800
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}
>>>>>>> e43d3ec (feat: Add dark mode variant and restructure theme variable declarations.)
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
