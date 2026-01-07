import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Default Deal Pipeline
    const pipeline = await prisma.dealPipeline.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Default Sales Pipeline',
            is_default: true,
        },
    });

    console.log('Created Deal Pipeline:', pipeline);

    // 2. Create Deal Stages
    const stages = [
        { name: 'Qualification', sort_order: 10, probability: 10 },
        { name: 'Needs Analysis', sort_order: 20, probability: 30 },
        { name: 'Value Proposition', sort_order: 30, probability: 50 },
        { name: 'Proposal / Price Quote', sort_order: 40, probability: 70 },
        { name: 'Negotiation / Review', sort_order: 50, probability: 80 },
        { name: 'Closed Won', sort_order: 60, probability: 100 },
        { name: 'Closed Lost', sort_order: 70, probability: 0 },
    ];

    for (const stage of stages) {
        const s = await prisma.dealStage.create({
            data: {
                name: stage.name,
                pipeline_id: pipeline.id,
                sort_order: stage.sort_order,
                probability: stage.probability,
            },
        });
        console.log('Created Stage:', s.name);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
