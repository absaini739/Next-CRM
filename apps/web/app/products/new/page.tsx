'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
            };

            await api.post('/products', payload);
            toast.success('Product created successfully');
            router.push('/products');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Add New Product</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Add a product to your catalog
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="SKU"
                            required
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="PROD-001"
                        />

                        <Input
                            label="Product Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enterprise Software License"
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

                        <Input
                            label="Price"
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="999.99"
                        />

                        <Input
                            label="Quantity"
                            type="number"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="100"
                        />

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button type="button" variant="secondary" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
