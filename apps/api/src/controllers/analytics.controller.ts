import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Get total leads
        const totalLeads = await prisma.lead.count();

        // Get won/lost revenue (checking both status and stage_id for robustness)
        const wonLeads = await prisma.lead.findMany({
            where: {
                OR: [
                    { status: 1 },
                    { stage_id: 5 } // Won stage
                ]
            },
            select: { lead_value: true }
        });
        const wonRevenue = wonLeads.reduce((sum, lead) => sum + (parseFloat(lead.lead_value?.toString() || '0')), 0);

        const lostLeads = await prisma.lead.findMany({
            where: { status: 0 }, // Lost
            select: { lead_value: true }
        });
        const lostRevenue = lostLeads.reduce((sum, lead) => sum + (parseFloat(lead.lead_value?.toString() || '0')), 0);

        // Average lead value
        const avgLeadValue = totalLeads > 0 ? wonRevenue / totalLeads : 0;

        // Total quotes
        const totalQuotes = await prisma.quote.count();

        // Total persons and organizations
        const totalPersons = await prisma.person.count();
        const totalOrganizations = await prisma.organization.count();

        // Email Stats
        const totalEmails = await prisma.email.count();
        const totalEmailsSent = await prisma.email.count({ where: { folder: 'sent' } });
        const totalEmailsReceived = await prisma.email.count({ where: { folder: 'inbox' } });

        // Average leads per day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentLeads = await prisma.lead.count({
            where: {
                created_at: { gte: thirtyDaysAgo }
            }
        });
        const avgLeadsPerDay = recentLeads / 30;

        res.json({
            wonRevenue,
            lostRevenue,
            avgLeadValue,
            totalLeads,
            avgLeadsPerDay,
            totalQuotes,
            totalPersons,
            totalOrganizations,
            emailStats: {
                total: totalEmails,
                sent: totalEmailsSent,
                received: totalEmailsReceived
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

export const getLeadsByStages = async (req: Request, res: Response) => {
    try {
        const leadsByStage = await prisma.lead.groupBy({
            by: ['stage_id'],
            _count: true,
            where: {
                status: { not: 1 } // Exclude won leads
            }
        });

        // Get stage names
        const stageIds = leadsByStage.map(item => item.stage_id).filter(Boolean) as number[];
        const stages = await prisma.leadStage.findMany({
            where: { id: { in: stageIds } },
            select: { id: true, name: true }
        });

        const data = leadsByStage.map(item => {
            const stage = stages.find((s: any) => s.id === item.stage_id);
            return {
                stage: stage?.name || 'Unassigned',
                count: item._count
            };
        });

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching leads by stages' });
    }
};

export const getRevenueBySource = async (req: Request, res: Response) => {
    try {
        const revenueBySource = await prisma.lead.groupBy({
            by: ['lead_source_id'],
            _sum: { lead_value: true },
            where: { status: 1 } // Won leads only
        });

        const sourceIds = revenueBySource.map(item => item.lead_source_id).filter(Boolean) as number[];
        const sources = await prisma.leadSource.findMany({
            where: { id: { in: sourceIds } },
            select: { id: true, name: true }
        });

        const data = revenueBySource.map(item => {
            const source = sources.find((s: any) => s.id === item.lead_source_id);
            return {
                source: source?.name || 'Unknown',
                revenue: parseFloat(item._sum.lead_value?.toString() || '0')
            };
        });

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching revenue by source' });
    }
};

export const getRevenueByType = async (req: Request, res: Response) => {
    try {
        const revenueByType = await prisma.lead.groupBy({
            by: ['lead_type_id'],
            _sum: { lead_value: true },
            where: { status: 1 }
        });

        const typeIds = revenueByType.map(item => item.lead_type_id).filter(Boolean) as number[];
        const types = await prisma.leadType.findMany({
            where: { id: { in: typeIds } },
            select: { id: true, name: true }
        });

        const data = revenueByType.map(item => {
            const type = types.find((t: any) => t.id === item.lead_type_id);
            return {
                type: type?.name || 'Unknown',
                revenue: parseFloat(item._sum.lead_value?.toString() || '0')
            };
        });

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching revenue by type' });
    }
};

export const getLeadsOverTime = async (req: Request, res: Response) => {
    try {
        // Get leads for last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const leads = await prisma.lead.findMany({
            where: {
                created_at: { gte: twelveMonthsAgo }
            },
            select: { created_at: true }
        });

        // Group by month
        const monthlyData: { [key: string]: number } = {};
        leads.forEach(lead => {
            const month = lead.created_at.toISOString().substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const data = Object.entries(monthlyData).map(([month, count]) => ({
            month,
            count
        })).sort((a, b) => a.month.localeCompare(b.month));

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching leads over time' });
    }
};
