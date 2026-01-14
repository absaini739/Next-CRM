'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/usePermissions';

export default function UsersPage() {
    const { hasPermission, canPerformAction } = usePermissions();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role_id: ''
    });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await api.get('/roles');
            setRoles(data);
            if (data.length > 0 && !formData.role_id) {
                setFormData(prev => ({ ...prev, role_id: data[0].id.toString() }));
            }
        } catch (error) {
            toast.error('Failed to fetch roles');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditMode && editingUserId) {
                // Update existing user
                const updateData: any = {
                    name: formData.name,
                    role_id: parseInt(formData.role_id)
                };
                // Only include password if it's provided
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await api.put(`/auth/users/${editingUserId}`, updateData);
                toast.success('User updated successfully');
            } else {
                // Create new user
                await api.post('/auth/register', {
                    ...formData,
                    role_id: parseInt(formData.role_id)
                });
                toast.success('User created successfully');
            }
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingUserId(null);
            setFormData({ name: '', email: '', password: '', role_id: roles[0]?.id.toString() || '' });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`;
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = (user: any) => {
        setIsEditMode(true);
        setEditingUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't pre-fill password
            role_id: user.role_id.toString()
        });
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/auth/users/${id}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to delete user';
            toast.error(message);
        }
    };

    const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (role: any) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {role?.name || 'N/A'}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: any, user: any) => (
                <div className="flex space-x-2">
                    {canPerformAction('settings.user.users', 'edit') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Edit User"
                            className="text-gray-400 dark:text-slate-400 hover:text-blue-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user);
                            }}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    )}
                    {canPerformAction('settings.user.users', 'delete') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Delete User"
                            className="text-gray-400 dark:text-slate-400 hover:text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                            }}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">User Management</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage system users and their access roles
                        </p>
                    </div>
                    {canPerformAction('settings.user.users', 'create') && (
                        <Button
                            variant="primary"
                            className="flex items-center"
                            onClick={() => {
                                setIsEditMode(false);
                                setEditingUserId(null);
                                setFormData({ name: '', email: '', password: '', role_id: roles[0]?.id.toString() || '' });
                                setIsModalOpen(true);
                            }}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add User
                        </Button>
                    )}
                </div>

                <Card>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={users} />
                    )}
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingUserId(null);
                    setFormData({ name: '', email: '', password: '', role_id: roles[0]?.id.toString() || '' });
                }}
                title={isEditMode ? 'Edit User' : 'Create New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required={!isEditMode}
                        disabled={isEditMode}
                        placeholder="john@example.com"
                    />
                    <Input
                        label={isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!isEditMode}
                        placeholder="••••••••"
                    />
                    <Select
                        label="Assign Role"
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleInputChange}
                        required
                        options={roles.map(r => ({ value: r.id, label: r.name }))}
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
