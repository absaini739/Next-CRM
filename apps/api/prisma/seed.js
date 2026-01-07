"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding ...');
    // Create Role
    const adminRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Administrator',
            permission_type: 'all',
            permissions: { all: true },
        },
    });
    console.log('Created Role:', adminRole);
    // Create Admin User
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@example.com',
            password: await bcryptjs_1.default.hash('admin123', 10),
            role_id: adminRole.id,
            status: true,
        },
    });
    console.log('Created User:', adminUser);
    // Create Lead Sources
    const leadSources = [
        { name: 'Website' },
        { name: 'Referral' },
        { name: 'Cold Call' },
    ];
    for (const source of leadSources) {
        await prisma.leadSource.create({ data: source });
    }
    // Create Lead Types
    const leadTypes = [
        { name: 'New Business' },
        { name: 'Existing Customer' },
    ];
    for (const type of leadTypes) {
        await prisma.leadType.create({ data: type });
    }
    // Create Lead Stages
    // Note: Schema has LeadStage model, but also LeadPipelineStage via LeadPipeline.
    // We'll seed generic LeadStage for now as per schema if used, or PipelineStages.
    // The schema has `model LeadStage`.
    const leadStages = [
        { name: 'New' },
        { name: 'Contacted' },
        { name: 'Qualified' },
        { name: 'Lost' },
        { name: 'Won' },
    ];
    for (const stage of leadStages) {
        await prisma.leadStage.create({ data: stage });
    }
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
