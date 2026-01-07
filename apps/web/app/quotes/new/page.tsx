'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NewQuotePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [persons, setPersons] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        person_id: '',
    });
    const [items, setItems] = useState<any[]>([
        { product_id: '', quantity: 1, price: 0 },
    ]);

    useEffect(() => {
        fetchPersons();
        fetchProducts();
    }, []);

    const fetchPersons = async () => {
        try {
            const response = await api.get('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error('Failed to load persons');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to load products');
        }
    };

    const addItem = () => {
        setItems([...items, { product_id: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill price when product is selected
        if (field === 'product_id') {
            const product = products.find((p: any) => p.id === parseInt(value));
            if (product) {
                newItems[index].price = parseFloat((product as any).price || 0);
            }
        }

        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                person_id: parseInt(formData.person_id),
                items: items.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price),
                })),
            };

            await api.post('/quotes', payload);
            toast.success('Quote created successfully');
            router.push('/quotes');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create quote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Create New Quote</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Generate a quote for your customer
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card title="Quote Details">
                        <div className="space-y-6">
                            <Input
                                label="Subject"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Q-2024-001 - Enterprise License"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <Select
                                label="Customer"
                                required
                                value={formData.person_id}
                                onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                                options={[
                                    { value: '', label: 'Select a customer...' },
                                    ...persons.map((p: any) => ({ value: p.id, label: p.name })),
                                ]}
                            />
                        </div>
                    </Card>

                    <Card
                        title="Line Items"
                        action={
                            <Button type="button" size="sm" onClick={addItem}>
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Item
                            </Button>
                        }
                    >
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <Select
                                            label="Product"
                                            required
                                            value={item.product_id}
                                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                            options={[
                                                { value: '', label: 'Select product...' },
                                                ...products.map((p: any) => ({ value: p.id, label: `${p.name} - $${p.price}` })),
                                            ]}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            label="Qty"
                                            type="number"
                                            required
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Input
                                            label="Price"
                                            type="number"
                                            step="0.01"
                                            required
                                            value={item.price}
                                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <div className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Total</div>
                                        <div className="font-semibold">${(item.quantity * item.price).toFixed(2)}</div>
                                    </div>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-end">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">Grand Total</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                            ${calculateTotal().toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Quote'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
