import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Initializing Deal Pipeline and Stages...');

    let pipeline = await prisma.dealPipeline.findFirst({
        where: { is_default: true }
    });

    if (!pipeline) {
        pipeline = await prisma.dealPipeline.create({
            data: {
                name: 'Standard Pipeline',
                is_default: true,
            },
        });
        console.log('Created Deal Pipeline:', pipeline.id);
    } else {
        console.log('Found existing Deal Pipeline:', pipeline.id);
    }

    const stages = [
        { name: 'Qualified', probability: 20 },
        { name: 'Proposal', probability: 40 },
        { name: 'Negotiation', probability: 60 },
        { name: 'Closing', probability: 80 },
        { name: 'Closed Won', probability: 100 },
        { name: 'Closed Lost', probability: 0 },
    ];

    for (const stage of stages) {
        const existingStage = await prisma.dealStage.findFirst({
            where: { 
                name: stage.name,
                pipeline_id: pipeline.id
            }
        });

        if (!existingStage) {
            const newStage = await prisma.dealStage.create({
                data: {
                    name: stage.name,
                    probability: stage.probability,
                    pipeline_id: pipeline.id,
                }
            });
            console.log(`Created Deal Stage: ${newStage.name} (ID: ${newStage.id})`);
        } else {
            console.log(`Stage ${stage.name} already exists (ID: ${existingStage.id})`);
        }
    }

    console.log('Initialization complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
