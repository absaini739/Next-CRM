import { prisma } from '../lib/prisma';

interface EmailAddresses {
    from: string;
    to: string[];
    cc: string[];
    bcc: string[];
}

interface LinkedEntities {
    persons: number[];
    leads: number[];
    deals: number[];
    organizations: number[];
}

/**
 * Extract all email addresses from an email message
 */
function extractEmailAddresses(emailMessage: any): string[] {
    const addresses = new Set<string>();

    // Add from email
    if (emailMessage.from_email) {
        addresses.add(emailMessage.from_email.toLowerCase());
    }

    // Add to emails
    if (Array.isArray(emailMessage.to)) {
        emailMessage.to.forEach((recipient: any) => {
            const email = typeof recipient === 'string' ? recipient : recipient.email;
            if (email) addresses.add(email.toLowerCase());
        });
    }

    // Add cc emails
    if (Array.isArray(emailMessage.cc)) {
        emailMessage.cc.forEach((recipient: any) => {
            const email = typeof recipient === 'string' ? recipient : recipient.email;
            if (email) addresses.add(email.toLowerCase());
        });
    }

    // Add bcc emails (if available)
    if (Array.isArray(emailMessage.bcc)) {
        emailMessage.bcc.forEach((recipient: any) => {
            const email = typeof recipient === 'string' ? recipient : recipient.email;
            if (email) addresses.add(email.toLowerCase());
        });
    }

    return Array.from(addresses);
}

/**
 * Auto-link email to CRM entities based on email addresses
 */
export async function autoLinkEmail(emailMessageId: number) {
    try {
        // Get the email message
        const emailMessage = await prisma.emailMessage.findUnique({
            where: { id: emailMessageId },
        });

        if (!emailMessage) {
            console.error(`Email message ${emailMessageId} not found`);
            return null;
        }

        // Extract all email addresses
        const emailAddresses = extractEmailAddresses(emailMessage);

        if (emailAddresses.length === 0) {
            console.log(`No email addresses found in message ${emailMessageId}`);
            return null;
        }

        const linked: LinkedEntities = {
            persons: [],
            leads: [],
            deals: [],
            organizations: [],
        };

        // 1. Find matching Persons
        // Search for persons whose emails JSON array contains any of our email addresses
        const persons = await prisma.person.findMany({
            where: {
                OR: emailAddresses.map(email => ({
                    emails: {
                        path: '$[*].value',
                        string_contains: email,
                    },
                })),
            },
        });

        // 2. Find matching Leads
        const leads = await prisma.lead.findMany({
            where: {
                OR: [
                    { primary_email: { in: emailAddresses } },
                    { secondary_email: { in: emailAddresses } },
                ],
            },
        });

        // 3. Find matching Organizations
        const organizations = await prisma.organization.findMany({
            where: {
                email: { in: emailAddresses },
            },
        });

        // 4. Find Deals through linked Persons and Leads
        const personIds = persons.map(p => p.id);
        const leadIds = leads.map(l => l.id);

        const deals = await prisma.deal.findMany({
            where: {
                OR: [
                    { person_id: { in: personIds } },
                    { lead_id: { in: leadIds } },
                ],
            },
        });

        // Link to first found entity of each type
        const updateData: any = {};

        if (persons.length > 0) {
            updateData.person_id = persons[0].id;
            linked.persons = persons.map(p => p.id);
        }

        if (leads.length > 0) {
            updateData.lead_id = leads[0].id;
            linked.leads = leads.map(l => l.id);
        }

        if (deals.length > 0) {
            updateData.deal_id = deals[0].id;
            linked.deals = deals.map(d => d.id);
        }

        // Update email message with linked entities
        if (Object.keys(updateData).length > 0) {
            await prisma.emailMessage.update({
                where: { id: emailMessageId },
                data: updateData,
            });

            console.log(`✅ Linked email ${emailMessageId} to:`, linked);
        } else {
            console.log(`ℹ️ No CRM entities found for email ${emailMessageId}`);
        }

        return {
            linked,
            isUnknown: Object.keys(updateData).length === 0,
            emailAddresses,
        };
    } catch (error) {
        console.error(`Error auto-linking email:`, error);
        return null;
    }
}

/**
 * Get emails for a specific Person
 */
export async function getPersonEmails(personId: number) {
    return await prisma.emailMessage.findMany({
        where: { person_id: personId },
        orderBy: { sent_at: 'desc' },
        take: 50,
    });
}

/**
 * Get emails for a specific Lead
 */
export async function getLeadEmails(leadId: number) {
    return await prisma.emailMessage.findMany({
        where: { lead_id: leadId },
        orderBy: { sent_at: 'desc' },
        take: 50,
    });
}

/**
 * Get emails for a specific Deal
 */
export async function getDealEmails(dealId: number) {
    return await prisma.emailMessage.findMany({
        where: { deal_id: dealId },
        orderBy: { sent_at: 'desc' },
        take: 50,
    });
}
