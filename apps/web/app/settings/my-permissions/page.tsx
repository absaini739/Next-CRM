'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { usePermissions } from '@/lib/usePermissions';
import { ShieldCheckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface PermissionNode {
    label: string;
    permissions?: string[];
    children?: Record<string, PermissionNode>;
}

export default function MyPermissionsPage() {
    const { user, isAdmin, hasPermission, canPerformAction } = usePermissions();
    const [permissionsTree, setPermissionsTree] = useState<Record<string, PermissionNode>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPermissionsTree();
    }, []);

    const fetchPermissionsTree = async () => {
        try {
            const response = await api.get('/roles/permissions-tree');
            setPermissionsTree(response.data);
        } catch (error) {
            console.error('Failed to fetch permissions tree:', error);
        } finally {
            setLoading(false);
        }
    };

    // Use the shared hasPermission function from usePermissions hook
    // This ensures consistency with permission checking across the app
    const checkPermission = (category: string, subcategory?: string, action?: string): boolean => {
        if (isAdmin) return true;

        if (action && subcategory) {
            // Check specific action permission (e.g., settings.user.users -> create)
            return canPerformAction(`${category}.${subcategory}`, action);
        } else if (subcategory) {
            // Check if subcategory exists (e.g., settings.user.users)
            return hasPermission(`${category}.${subcategory}`);
        } else if (action) {
            // Check top-level action (e.g., leads -> create)
            return canPerformAction(category, action);
        } else {
            // Check if category exists (e.g., settings)
            return hasPermission(category);
        }
    };

    const renderPermissionBadge = (hasAccess: boolean) => {
        return hasAccess ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
        ) : (
            <XCircleIcon className="h-5 w-5 text-gray-300 dark:text-slate-600" />
        );
    };

    const renderPermissions = (
        category: string,
        node: PermissionNode,
        level: number = 0
    ) => {
        const hasCategory = checkPermission(category);
        const indent = level * 24;

        return (
            <div key={category} className="mb-4">
                <div
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                    style={{ marginLeft: `${indent}px` }}
                >
                    <div className="flex items-center space-x-3">
                        {renderPermissionBadge(hasCategory)}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {node.label}
                        </span>
                    </div>
                </div>

                {/* Render direct permissions */}
                {node.permissions && node.permissions.length > 0 && (
                    <div className="mt-2 space-y-1" style={{ marginLeft: `${indent + 24}px` }}>
                        {node.permissions.map((perm) => {
                            const hasAccess = checkPermission(category, undefined, perm);
                            return (
                                <div
                                    key={perm}
                                    className={`flex items-center space-x-2 p-2 rounded ${hasAccess
                                        ? 'bg-green-50 dark:bg-green-900/20'
                                        : 'bg-gray-50 dark:bg-slate-800'
                                        }`}
                                >
                                    {renderPermissionBadge(hasAccess)}
                                    <span
                                        className={`text-sm ${hasAccess
                                            ? 'text-green-700 dark:text-green-400 font-medium'
                                            : 'text-gray-400 dark:text-slate-500'
                                            }`}
                                    >
                                        {perm}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Render nested children */}
                {node.children && (
                    <div className="mt-2 space-y-2">
                        {Object.entries(node.children).map(([childKey, childNode]) => {
                            const hasSubcategory = checkPermission(category, childKey);
                            return (
                                <div key={childKey} style={{ marginLeft: `${indent + 24}px` }}>
                                    <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded">
                                        <div className="flex items-center space-x-2">
                                            {renderPermissionBadge(hasSubcategory)}
                                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                                {childNode.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Render subcategory permissions */}
                                    {childNode.permissions && childNode.permissions.length > 0 && (
                                        <div className="mt-1 ml-6 space-y-1">
                                            {childNode.permissions.map((perm) => {
                                                const hasAccess = checkPermission(category, childKey, perm);
                                                return (
                                                    <div
                                                        key={perm}
                                                        className={`flex items-center space-x-2 p-1.5 rounded text-xs ${hasAccess
                                                            ? 'bg-green-50 dark:bg-green-900/20'
                                                            : 'bg-gray-50 dark:bg-slate-800'
                                                            }`}
                                                    >
                                                        {renderPermissionBadge(hasAccess)}
                                                        <span
                                                            className={
                                                                hasAccess
                                                                    ? 'text-green-700 dark:text-green-400 font-medium'
                                                                    : 'text-gray-400 dark:text-slate-500'
                                                            }
                                                        >
                                                            {perm}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Render nested children of children */}
                                    {childNode.children && (
                                        <div className="mt-1 ml-6 space-y-1">
                                            {Object.entries(childNode.children).map(
                                                ([nestedKey, nestedNode]) => {
                                                    return (
                                                        <div key={nestedKey}>
                                                            <div className="flex items-center space-x-2 p-1.5 bg-gray-50 dark:bg-slate-700 rounded text-xs">
                                                                <span className="font-medium text-gray-600 dark:text-slate-400">
                                                                    {nestedNode.label}
                                                                </span>
                                                            </div>
                                                            {nestedNode.permissions && (
                                                                <div className="ml-4 mt-1 space-y-1">
                                                                    {nestedNode.permissions.map((perm) => {
                                                                        const path = `${category}.${childKey}.${nestedKey}`;
                                                                        const hasAccess = checkPermission(
                                                                            category,
                                                                            `${childKey}.${nestedKey}`,
                                                                            perm
                                                                        );
                                                                        return (
                                                                            <div
                                                                                key={perm}
                                                                                className={`flex items-center space-x-2 p-1 rounded text-xs ${hasAccess
                                                                                    ? 'bg-green-50 dark:bg-green-900/20'
                                                                                    : 'bg-gray-50 dark:bg-slate-800'
                                                                                    }`}
                                                                            >
                                                                                {renderPermissionBadge(hasAccess)}
                                                                                <span
                                                                                    className={
                                                                                        hasAccess
                                                                                            ? 'text-green-700 dark:text-green-400 font-medium'
                                                                                            : 'text-gray-400 dark:text-slate-500'
                                                                                    }
                                                                                >
                                                                                    {perm}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                        My Permissions
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        View your assigned role and access permissions
                    </p>
                </div>

                {/* Role Info */}
                <Card className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user?.role?.name || 'No Role Assigned'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                {(user?.role as any)?.description || 'No description available'}
                            </p>
                            {isAdmin && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                    ✓ Full Administrator Access
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Permissions Tree */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Access Permissions
                    </h3>
                    <div className="space-y-3">
                        {isAdmin ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-green-700 dark:text-green-400 font-medium">
                                    As an administrator, you have full access to all features and settings.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400 mb-4">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                    <span>= You have access</span>
                                    <XCircleIcon className="h-4 w-4 text-gray-300 dark:text-slate-600 ml-4" />
                                    <span>= No access</span>
                                </div>
                                {Object.entries(permissionsTree).map(([key, node]) =>
                                    renderPermissions(key, node)
                                )}
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
