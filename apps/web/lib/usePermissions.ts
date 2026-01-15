'use client';

import { useAuth } from '@/context/AuthContext';

/**
 * Simplified permission hook that actually works
 */
export function usePermissions() {
    const { user } = useAuth();

    /**
     * Check if user has a specific permission
     */
    const hasPermission = (permissionPath?: string): boolean => {
        // If no permission required, allow
        if (!permissionPath) return true;

        // If no user, deny
        if (!user || !user.role) return false;

        // Administrator always has access
        if (user.role.name.toLowerCase() === 'administrator') {
            return true;
        }

        const permissions = user.role.permissions;
        if (!permissions || typeof permissions !== 'object') return false;

        // CASE 1: Check for exact match in flat keys
        // e.g. checking 'settings.automation.emailAccounts' and user has that key
        if (permissions[permissionPath]) {
            const value = permissions[permissionPath];
            if (Array.isArray(value) && value.length > 0) return true;
        }

        // CASE 2: Check for parent path access
        // e.g. checking 'settings' and user has 'settings.user.users'
        // We need to see if ANY key starts with "permissionPath."
        const prefix = permissionPath + '.';
        const hasChildPermission = Object.keys(permissions).some(key =>
            key.startsWith(prefix) &&
            Array.isArray(permissions[key]) &&
            permissions[key].length > 0
        );

        return hasChildPermission;
    };

    /**
     * Helper function to check if any child permissions exist under a given path
     */
    const hasAnyChildPermissions = (obj: any, searchKey: string): boolean => {
        if (!obj || typeof obj !== 'object') return false;

        // Direct match
        if (obj[searchKey] !== undefined) {
            const value = obj[searchKey];
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value).length > 0;
            }
            return !!value;
        }

        return false;
    };

    const hasAnyPermission = (permissionPaths: string[]): boolean => {
        return permissionPaths.some(path => hasPermission(path));
    };

    const hasAllPermissions = (permissionPaths: string[]): boolean => {
        return permissionPaths.every(path => hasPermission(path));
    };

    const canPerformAction = (resource: string, action: string): boolean => {
        // Admin can do everything
        if (user?.role?.name.toLowerCase() === 'administrator') {
            return true;
        }

        const permissions = user?.role?.permissions;
        if (!permissions) return false;

        // Check for exact resource match in flat keys
        // e.g. resource='settings.user.users'
        if (permissions[resource] && Array.isArray(permissions[resource])) {
            return permissions[resource].includes(action);
        }

        return false;
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canPerformAction,
        user,
        isAdmin: user?.role?.name.toLowerCase() === 'administrator'
    };
}
