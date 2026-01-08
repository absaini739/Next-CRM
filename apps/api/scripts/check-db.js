"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const userCount = await prisma.user.count();
        const roleCount = await prisma.role.count();
        const personCount = await prisma.person.count();
        const leadCount = await prisma.lead.count();
        const dealCount = await prisma.deal.count();
        const activityCount = await prisma.activity.count();
        const leadStageCount = await prisma.leadStage.count();
        const leadPipelineCount = await prisma.leadPipeline.count();
        console.log('--- DB Counts ---');
        console.log('Users:', userCount);
        console.log('Roles:', roleCount);
        console.log('Persons:', personCount);
        console.log('Leads:', leadCount);
        console.log('Deals:', dealCount);
        console.log('Activities:', activityCount);
        console.log('LeadStages:', leadStageCount);
        console.log('LeadPipelines:', leadPipelineCount);
    }
    catch (error) {
        console.error('DB Check Failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
