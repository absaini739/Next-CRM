'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowUpTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

export default function DataTransferPage() {
    const [importType, setImportType] = useState('persons');
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setImporting(true);
        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target?.result as string;

                // Determine field mapping based on entity type
                let fieldMapping: any = {};
                if (importType === 'persons') {
                    fieldMapping = { name: 'Name', email: 'Email', phone: 'Phone' };
                } else if (importType === 'products') {
                    fieldMapping = { sku: 'SKU', name: 'Name', description: 'Description', price: 'Price', quantity: 'Quantity' };
                } else if (importType === 'leads') {
                    fieldMapping = { title: 'Title', description: 'Description', value: 'Value' };
                }

                const response = await api.post('/data-transfer/import', {
                    entity_type: importType,
                    file_data: {
                        type: file.name.endsWith('.csv') ? 'csv' : 'xlsx',
                        content: file.name.endsWith('.csv') ? content : content.split(',')[1] // base64 for xlsx
                    },
                    field_mapping: fieldMapping
                });

                setImportResult(response.data);
                toast.success(`Import completed! ${response.data.success_count} records imported.`);
                setFile(null);
            };

            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const handleExport = async (format: 'csv' | 'xlsx') => {
        try {
            const response = await api.get(`/data-transfer/export?entity_type=${importType}&format=${format}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${importType}_export.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success(`${importType} exported successfully`);
        } catch (error) {
            toast.error('Export failed');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Data Transfer</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Import and export your CRM data
                    </p>
                </div>

                {/* Import Section */}
                <Card title="Import Data">
                    <div className="space-y-4">
                        <Select
                            label="Entity Type"
                            value={importType}
                            onChange={(e) => setImportType(e.target.value)}
                            options={[
                                { value: 'persons', label: 'Persons' },
                                { value: 'products', label: 'Products' },
                                { value: 'leads', label: 'Leads' },
                            ]}
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Upload File (CSV or Excel)
                            </label>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 dark:text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {file && (
                                <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Selected: {file.name}</p>
                            )}
                        </div>

                        {/* Sample CSV Download */}
                        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">Download Sample CSV:</h4>
                            <div className="flex flex-wrap gap-2">
                                {importType === 'leads' && (
                                    <a
                                        href="/samples/leads_sample.csv"
                                        download="leads_sample.csv"
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                        leads_sample.csv
                                    </a>
                                )}
                                {importType === 'persons' && (
                                    <a
                                        href="/samples/persons_sample.csv"
                                        download="persons_sample.csv"
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                        persons_sample.csv
                                    </a>
                                )}
                                {importType === 'products' && (
                                    <a
                                        href="/samples/products_sample.csv"
                                        download="products_sample.csv"
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                        products_sample.csv
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Required Columns:</h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                {importType === 'persons' && (
                                    <>
                                        <li>• Name (required)</li>
                                        <li>• Email (optional)</li>
                                        <li>• Phone (optional)</li>
                                        <li>• Organization (optional)</li>
                                        <li>• Job Title (optional)</li>
                                    </>
                                )}
                                {importType === 'products' && (
                                    <>
                                        <li>• SKU (required)</li>
                                        <li>• Name (required)</li>
                                        <li>• Description (optional)</li>
                                        <li>• Price (optional)</li>
                                        <li>• Quantity (optional)</li>
                                        <li>• Category (optional)</li>
                                    </>
                                )}
                                {importType === 'leads' && (
                                    <>
                                        <li>• Title (required)</li>
                                        <li>• Description (optional)</li>
                                        <li>• First Name, Last Name (optional)</li>
                                        <li>• Company Name, Job Title (optional)</li>
                                        <li>• Website, LinkedIn URL (optional)</li>
                                        <li>• Location (optional)</li>
                                        <li>• Primary Email, Secondary Email (optional)</li>
                                        <li>• Phone, Mobile (optional)</li>
                                        <li>• Lead Rating (Hot/Warm/Cold) (optional)</li>
                                        <li>• No Employees (optional)</li>
                                        <li>• Lead Value (optional)</li>
                                        <li>• Status (In Progress/Won/Lost) (optional)</li>
                                        <li>• Source, Type (optional)</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={!file || importing}
                            className="flex items-center"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            {importing ? 'Importing...' : 'Import Data'}
                        </Button>

                        {importResult && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                <h4 className="text-sm font-medium text-green-900 mb-2">Import Results:</h4>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Total Rows: {importResult.total_rows}</li>
                                    <li>• Successfully Imported: {importResult.success_count}</li>
                                    <li>• Failed: {importResult.failed_count}</li>
                                </ul>
                                {importResult.errors && importResult.errors.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium text-red-900">Errors:</p>
                                        <ul className="text-xs text-red-700 mt-1">
                                            {importResult.errors.map((err: any, idx: number) => (
                                                <li key={idx}>Row {err.row}: {err.error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Export Section */}
                <Card title="Export Data">
                    <div className="space-y-4">
                        <Select
                            label="Entity Type"
                            value={importType}
                            onChange={(e) => setImportType(e.target.value)}
                            options={[
                                { value: 'persons', label: 'Persons' },
                                { value: 'products', label: 'Products' },
                                { value: 'leads', label: 'Leads' },
                            ]}
                        />

                        <div className="flex space-x-3">
                            <Button
                                variant="primary"
                                onClick={() => handleExport('csv')}
                                className="flex items-center"
                            >
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                Export as CSV
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleExport('xlsx')}
                                className="flex items-center"
                            >
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                Export as Excel
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
