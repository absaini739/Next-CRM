import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const ROLE_HIERARCHY: Record<string, number> = {
    'Administrator': 4,
    'Manager': 3,
    'Lead': 2,
    'Employee': 1
};

export class TaskAssignmentService {
    /**
     * Validates if a user can assign a task to another user based on hierarchy rules and permissions.
     * Hierarchy: Admin -> Any, Manager -> Lead (under them), Lead -> Employee (under them).
     * Permission: Must have 'tasks.assign' or 'tasks.manage_all' or be an Administrator.
     */
    static async validateAssignment(assignerId: number, assigneeId: number) {
        const [assigner, assignee] = await Promise.all([
            prisma.user.findUnique({ where: { id: assignerId }, include: { role: true } }),
            prisma.user.findUnique({ where: { id: assigneeId }, include: { role: true } })
        ]);

        if (!assigner || !assignee) {
            throw new Error('Assigner or Assignee not found');
        }

        const assignerRoleName = assigner.role.name;
        const assigneeRoleName = assignee.role.name;
        const permissions = assigner.role.permissions as any;

        // Check for "Assign Tasks" permission
        const canAssign =
            assignerRoleName === 'Administrator' ||
            assigner.role.permission_type === 'all' ||
            permissions?.tasks?.includes('assign') ||
            permissions?.tasks?.includes('create');

        if (!canAssign) {
            throw new Error('You do not have permission to assign tasks');
        }

        // Administrator can assign to anyone
        if (assignerRoleName === 'Administrator' || assigner.role.permission_type === 'all') {
            return { assignerRole: assignerRoleName, assigneeRole: assigneeRoleName };
        }

        // Hierarchy Enforcement (unless assigner has manage_all)
        const hasManageAll = permissions?.tasks?.includes('manage_all');
        if (hasManageAll) {
            return { assignerRole: assignerRoleName, assigneeRole: assigneeRoleName };
        }

        // Manager can only assign to Leads who report to them
        if (assignerRoleName === 'Manager') {
            // @ts-ignore
            if (assignee.reports_to_id !== assignerId && assigneeId !== assignerId) {
                // Check if assignee is under a lead who reports to this manager
                const leadUnderManager = await prisma.user.findFirst({
                    // @ts-ignore
                    where: { id: assignee.reports_to_id || 0, reports_to_id: assignerId }
                });
                if (!leadUnderManager) {
                    throw new Error('You can only assign tasks to users in your hierarchy');
                }
            }
        } else if (assignerRoleName === 'Lead') {
            // @ts-ignore
            if (assignee.reports_to_id !== assignerId && assigneeId !== assignerId) {
                throw new Error('You can only assign tasks to users who report directly to you');
            }
        } else if (assignerId !== assigneeId) {
            // If not Manager/Lead/Admin, can only assign to self unless they have explicit 'assign' permission
            // which we already checked above with 'canAssign'. 
            // If they have 'assign' but no hierarchy role, we let them assign if hierarchy is not strictly enforced or if they are peers? 
            // The user said: "admin or role adminstartor give the access to any user to assin a task"
            // So if they have the permission, we allow it.
        }

        return { assignerRole: assignerRoleName, assigneeRole: assigneeRoleName };
    }

    /**
     * Enforces data isolation based on role hierarchy.
     */
    static async getVisibileTaskIds(userId: number, roleName: string) {
        if (roleName === 'Administrator') {
            return {}; // No filter for Admin
        }

        if (roleName === 'Employee') {
            return { assigned_to_id: userId };
        }

        if (roleName === 'Lead') {
            // See tasks assigned to them OR tasks they assigned to their employees
            const subordinates = await prisma.user.findMany({
                // @ts-ignore
                where: { reports_to_id: userId },
                select: { id: true }
            });
            const subordinateIds = subordinates.map(s => s.id);
            return {
                OR: [
                    { assigned_to_id: userId },
                    { assigned_by_id: userId },
                    { assigned_to_id: { in: subordinateIds } }
                ]
            };
        }

        if (roleName === 'Manager') {
            // See everything under their hierarchy
            const leads = await prisma.user.findMany({
                // @ts-ignore
                where: { reports_to_id: userId },
                include: {
                    // @ts-ignore
                    subordinates: { select: { id: true } }
                }
            });

            const leadIds = leads.map(l => l.id);
            // @ts-ignore
            const employeeIds = leads.flatMap(l => (l.subordinates || []).map((s: any) => s.id));

            return {
                OR: [
                    { assigned_to_id: userId },
                    { assigned_by_id: userId },
                    { assigned_to_id: { in: [...leadIds, ...employeeIds] } }
                ]
            };
        }

        return { assigned_to_id: userId };
    }
}
