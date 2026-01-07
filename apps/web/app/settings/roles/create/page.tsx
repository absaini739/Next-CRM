'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FolderIcon, DocumentIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Permission tree structure matching Krayin CRM completely
const PERMISSIONS_TREE = {
    dashboard: { label: 'Dashboard', permissions: ['view'] },
    leads: { label: 'Leads', permissions: ['create', 'view', 'edit', 'delete'] },
    deals: { label: 'Deals', permissions: ['create', 'view', 'edit', 'delete'] },
    quotes: { label: 'Quotes', permissions: ['create', 'edit', 'print', 'delete'] },
    mail: {
        label: 'Mail',
        permissions: ['inbox', 'draft', 'outbox', 'sent', 'trash', 'create', 'view', 'edit', 'delete']
    },
    activities: { label: 'Activities', permissions: ['create', 'edit', 'delete'] },
    contacts: {
        label: 'Contacts',
        children: {
            persons: { label: 'Persons', permissions: ['create', 'edit', 'delete', 'view'] },
            organizations: { label: 'Organizations', permissions: ['create', 'edit', 'delete'] }
        }
    },
    products: { label: 'Products', permissions: ['create', 'edit', 'delete', 'view'] },
    settings: {
        label: 'Settings',
        children: {
            user: {
                label: 'User',
                children: {
                    groups: { label: 'Groups', permissions: ['create', 'edit', 'delete'] },
                    roles: { label: 'Roles', permissions: ['create', 'edit', 'delete'] },
                    users: { label: 'Users', permissions: ['create', 'edit', 'delete'] }
                }
            },
            lead: {
                label: 'Lead',
                children: {
                    pipelines: { label: 'Pipelines', permissions: ['create', 'edit', 'delete'] },
                    sources: { label: 'Sources', permissions: ['create', 'edit', 'delete'] },
                    types: { label: 'Types', permissions: ['create', 'edit', 'delete'] }
                }
            },
            automation: {
                label: 'Automation',
                children: {
                    attributes: { label: 'Attributes', permissions: ['create', 'edit', 'delete'] },
                    webhook: { label: 'Webhook', permissions: ['create', 'edit', 'delete'] },
                    workflows: { label: 'Workflows', permissions: ['create', 'edit', 'delete'] },
                    events: { label: 'Event', permissions: ['create', 'edit', 'delete'] },
                    campaigns: { label: 'Campaigns', permissions: ['create', 'edit', 'delete'] },
                    emailTemplates: { label: 'Email Templates', permissions: ['create', 'edit', 'delete'] },
                    emailAccounts: { label: 'Email Accounts', permissions: ['create', 'edit', 'delete'] }
                }
            },
            otherSettings: {
                label: 'Other Settings',
                children: {
                    webForms: { label: 'Web Forms', permissions: ['view', 'create', 'edit', 'delete'] },
                    tags: { label: 'Tags', permissions: ['create', 'edit', 'delete'] },
                    dataTransfer: { label: 'Data Transfer', permissions: ['import', 'export'] }
                }
            }
        }
    },
    voip: {
        label: 'VoIP',
        children: {
            providers: { label: 'Providers', permissions: ['create', 'edit', 'delete'] },
            trunks: { label: 'Trunks', permissions: ['create', 'edit', 'delete'] },
            inboundRoutes: { label: 'Inbound Routes', permissions: ['create', 'edit', 'delete'] },
            callRecordings: { label: 'Call Recordings', permissions: ['play', 'download', 'delete'] },
            calls: { label: 'Calls', permissions: ['initiate', 'all_calls'] }
        }
    },
    configuration: { label: 'Configuration', permissions: ['view', 'edit'] }
};

interface PermissionNode {
    label: string;
    permissions?: string[];
    children?: Record<string, PermissionNode>;
}

export default function CreateRolePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['settings', 'contacts']));
    const [saving, setSaving] = useState(false);

    const toggleNode = (key: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedNodes(newExpanded);
    };

    const togglePermission = (module: string, permission: string) => {
        setSelectedPermissions(prev => {
            const current = prev[module] || [];
            if (current.includes(permission)) {
                return { ...prev, [module]: current.filter(p => p !== permission) };
            } else {
                return { ...prev, [module]: [...current, permission] };
            }
        });
    };

    const toggleAllPermissions = (module: string, permissions: string[]) => {
        setSelectedPermissions(prev => {
            const current = prev[module] || [];
            const allSelected = permissions.every(p => current.includes(p));
            if (allSelected) {
                return { ...prev, [module]: [] };
            } else {
                return { ...prev, [module]: [...permissions] };
            }
        });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Please enter a role name');
            return;
        }

        setSaving(true);
        try {
            await api.post('/roles', {
                name,
                description,
                permissions: selectedPermissions
            });
            toast.success('Role created successfully');
            router.push('/settings/roles');
        } catch (error) {
            toast.error('Failed to create role');
        } finally {
            setSaving(false);
        }
    };

    const renderPermissionNode = (
        key: string,
        node: PermissionNode,
        level: number = 0,
        parentPath: string = ''
    ): JSX.Element => {
        const fullPath = parentPath ? `${parentPath}.${key}` : key;
        const hasChildren = node.children && Object.keys(node.children).length > 0;
        const isExpanded = expandedNodes.has(fullPath);
        const currentPermissions = selectedPermissions[fullPath] || [];
        const allSelected = node.permissions && node.permissions.every(p => currentPermissions.includes(p));

        return (
            <div key={fullPath} style={{ marginLeft: level * 24 }}>
                <div className="flex items-center py-1.5 hover:bg-gray-50 rounded">
                    {/* Expand/Collapse icon */}
                    {hasChildren ? (
                        <button
                            onClick={() => toggleNode(fullPath)}
                            className="p-1 hover:bg-gray-200 rounded mr-1"
                        >
                            {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    ) : (
                        <span className="w-6" />
                    )}

                    {/* Folder/Document icon */}
                    {hasChildren ? (
                        <FolderIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    ) : (
                        <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                    )}

                    {/* Module checkbox (if has direct permissions) */}
                    {node.permissions && (
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => toggleAllPermissions(fullPath, node.permissions!)}
                            className="mr-2 rounded border-gray-300"
                        />
                    )}

                    {/* Label */}
                    <span className="text-sm font-medium text-gray-700">{node.label}</span>
                </div>

                {/* Permissions checkboxes */}
                {node.permissions && node.permissions.length > 0 && (
                    <div className="ml-12 flex flex-wrap gap-x-4 gap-y-1 py-1">
                        {node.permissions.map(permission => (
                            <label key={permission} className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <DocumentIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <input
                                    type="checkbox"
                                    checked={currentPermissions.includes(permission)}
                                    onChange={() => togglePermission(fullPath, permission)}
                                    className="mr-1.5 rounded border-gray-300"
                                />
                                <span className="capitalize">{permission}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Render children if expanded */}
                {hasChildren && isExpanded && (
                    <div className="ml-2">
                        {Object.entries(node.children!).map(([childKey, childNode]) =>
                            renderPermissionNode(childKey, childNode, level + 1, fullPath)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span>Dashboard</span>
                            <span className="mx-2">/</span>
                            <span>Settings</span>
                            <span className="mx-2">/</span>
                            <span>Roles</span>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900">Create Role</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Role'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Permissions Tree */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Permissions *</h3>
                                <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                                    <div className="flex items-center mb-3">
                                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">
                                            Custom
                                        </span>
                                    </div>
                                    {Object.entries(PERMISSIONS_TREE).map(([key, node]) =>
                                        renderPermissionNode(key, node as PermissionNode)
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* General Info */}
                    <div>
                        <Card>
                            <div className="p-4 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center justify-between">
                                    General
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                </h3>

                                <Input
                                    label="Name *"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Name"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description"
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
