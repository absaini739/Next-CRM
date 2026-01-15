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

        // Split the path and navigate through the permissions object
        const parts = permissionPath.split('.');
        let current: any = permissions;

        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                // Path doesn't exist - check if any child permissions exist
                // This handles cases like checking 'voip' when user has 'voip.providers.create'
                return hasAnyChildPermissions(current, part);
            }
        }

        // If we found something (array, object, or truthy value), grant access
        if (Array.isArray(current)) {
            return current.length > 0;
        }
        if (typeof current === 'object' && current !== null) {
            return Object.keys(current).length > 0;
        }
        return !!current;
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

        // Navigate to the resource
        const parts = resource.split('.');
        let current: any = permissions;

        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                return false;
            }
        }

        // Check if action exists in array
        if (Array.isArray(current)) {
            return current.includes(action);
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
