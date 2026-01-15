import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Simplified permission hook that actually works
 */
export function usePermissions() {
    const { user } = useAuth();

    /**
     * Check if user has a specific permission
     */
    const hasPermission = useCallback((permissionPath?: string): boolean => {
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
        if (permissions[permissionPath]) {
            const value = permissions[permissionPath];
            if (Array.isArray(value) && value.length > 0) return true;
        }

        // CASE 2: Check for parent path access
        const prefix = permissionPath + '.';
        const hasChildPermission = Object.keys(permissions).some(key =>
            key.startsWith(prefix) &&
            Array.isArray(permissions[key]) &&
            permissions[key].length > 0
        );

        return hasChildPermission;
    }, [user]);

    const hasAnyPermission = useCallback((permissionPaths: string[]): boolean => {
        return permissionPaths.some(path => hasPermission(path));
    }, [hasPermission]);

    const hasAllPermissions = useCallback((permissionPaths: string[]): boolean => {
        return permissionPaths.every(path => hasPermission(path));
    }, [hasPermission]);

    const canPerformAction = useCallback((resource: string, action: string): boolean => {
        // Admin can do everything
        if (user?.role?.name.toLowerCase() === 'administrator') {
            return true;
        }

        const permissions = user?.role?.permissions;
        if (!permissions) return false;

        // Check for exact resource match in flat keys
        if (permissions[resource] && Array.isArray(permissions[resource])) {
            return permissions[resource].includes(action);
        }

        return false;
    }, [user]);

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canPerformAction,
        user,
        isAdmin: user?.role?.name.toLowerCase() === 'administrator'
    };
}
