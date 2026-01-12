import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    description?: string;
    variables?: string[];
}

interface TemplateSelectorProps {
    onSelect: (template: EmailTemplate) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await api.get('/email-templates');
            setTemplates(data);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (template: EmailTemplate) => {
        onSelect(template);
        setIsOpen(false);
    };

    if (loading || templates.length === 0) return null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
                <span>Use Template</span>
                <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-20 max-h-96 overflow-y-auto">
                        <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 dark:text-slate-400 px-3 py-2">
                                Email Templates
                            </div>
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelect(template)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                >
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {template.name}
                                    </div>
                                    {template.description && (
                                        <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                            {template.description}
                                        </div>
                                    )}
                                    {template.variables && template.variables.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {template.variables.map((v) => (
                                                <span
                                                    key={v}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                >
                                                    {`{${v}}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
