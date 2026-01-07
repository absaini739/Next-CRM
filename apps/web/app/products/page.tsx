'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'sku', label: 'SKU', sortable: true },
        { key: 'name', label: 'Product Name', sortable: true },
        {
            key: 'price',
            label: 'Price',
            sortable: true,
            render: (price: string) => `$${parseFloat(price || "0").toLocaleString()}`,
        },
        {
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
        },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Products</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage your product catalog
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push('/products/new')}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Product
                    </Button>
                </div>

                <Card>
                    <DataTable
                        columns={columns}
                        data={products}
                        onRowClick={(product) => router.push(`/products/${product.id}`)}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
}
