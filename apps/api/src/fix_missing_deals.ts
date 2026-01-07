import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting retroactive deal conversion...');

    // 1. Find all leads that are "Won" (stage_id = 5)
    // AND don't have any deals associated with them or don't have linked person/org
    const wonLeads = await prisma.lead.findMany({
        where: {
            stage_id: 5,
        },
        include: {
            deals: true,
            person: true,
            organization: true,
        }
    });

    console.log(`Found ${wonLeads.length} leads in 'Won' stage.`);

    let fixedCount = 0;

    for (const lead of wonLeads) {
        // If lead already has deals, check if they are "open" and fix them
        if (lead.deals.length > 0) {
            const openDeals = lead.deals.filter(d => d.status === 'open');
            if (openDeals.length > 0) {
                console.log(`Fixing status for ${openDeals.length} existing deals of Lead ${lead.id}...`);
                for (const deal of openDeals) {
                    await prisma.deal.update({
                        where: { id: deal.id },
                        data: {
                            status: 'won',
                            stage_id: 6 // Closed Won
                        }
                    });
                    console.log(`  -> Updated Deal ${deal.id} to Won.`);
                    fixedCount++;
                }
            } else {
                console.log(`Lead ${lead.id} already has won/lost deals. Skipping.`);
            }
            continue;
        }

        console.log(`Creating missing deal for Lead ${lead.id} (${lead.title})...`);

        try {
            await prisma.$transaction(async (tx) => {
                const leadData = lead;

                // 1. Create Organization if company_name exists and not linked
                // ... (rest of logic same as before)
                let organizationId = leadData.organization_id;
                if (!organizationId && leadData.company_name) {
                    const org = await tx.organization.create({
                        data: {
                            name: leadData.company_name,
                            website: leadData.website,
                            user_id: leadData.user_id
                        }
                    });
                    organizationId = org.id;
                    console.log(`  -> Created Organization: ${org.name}`);
                }

                // 2. Create Person if first_name exists and not linked
                let personId = leadData.person_id;
                if (!personId && leadData.first_name) {
                    const person = await tx.person.create({
                        data: {
                            name: `${leadData.first_name} ${leadData.last_name || ''}`.trim(),
                            emails: leadData.primary_email ? [{ value: leadData.primary_email, label: 'Work' }] : [],
                            contact_numbers: leadData.phone ? [{ value: leadData.phone, label: 'Work' }] : [],
                            organization_id: organizationId,
                            user_id: leadData.user_id
                        }
                    });
                    personId = person.id;
                    console.log(`  -> Created Person: ${person.name}`);
                }

                // 3. Create Deal
                const deal = await tx.deal.create({
                    data: {
                        title: leadData.title,
                        description: leadData.description,
                        deal_value: leadData.lead_value,
                        status: 'won', // Changed to Won
                        person_id: personId,
                        organization_id: organizationId,
                        user_id: leadData.user_id,
                        lead_id: leadData.id,
                        pipeline_id: 1, // Default Pipeline
                        stage_id: 6     // Closed Won
                    }
                });
                console.log(`  -> Created Deal: ${deal.title}`);
                // ...

                // 4. Update lead with links
                if (personId !== leadData.person_id || organizationId !== leadData.organization_id) {
                    await tx.lead.update({
                        where: { id: leadData.id },
                        data: {
                            person_id: personId,
                            organization_id: organizationId
                        }
                    });
                    console.log(`  -> Updated Lead links.`);
                }
            });
            fixedCount++;
        } catch (error) {
            console.error(`Failed to fix lead ${lead.id}:`, error);
        }
    }

    console.log(`\nOperation Complete. Fixed ${fixedCount} leads.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
