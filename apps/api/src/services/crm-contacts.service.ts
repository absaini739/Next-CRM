import { prisma } from '../lib/prisma';

/**
 * Get all CRM-related email addresses
 * This includes emails from Users, Persons, Organizations, and Leads
 */
export async function getCRMContactEmails(userId: number): Promise<string[]> {
    const emails: string[] = [];

    try {
        // 1. Get all user emails (CRM users, admins, staff)
        const users = await prisma.user.findMany({
            select: { email: true }
        });
        users.forEach(u => {
            if (u.email) emails.push(u.email.toLowerCase().trim());
        });

        // 2. Get all person emails (contacts)
        const persons = await prisma.person.findMany({
            select: { emails: true }
        });
        persons.forEach(p => {
            if (p.emails && Array.isArray(p.emails)) {
                (p.emails as any[]).forEach((emailObj: any) => {
                    if (emailObj && emailObj.value) {
                        emails.push(emailObj.value.toLowerCase().trim());
                    }
                });
            }
        });

        // 3. Get all organization emails
        const organizations = await prisma.organization.findMany({
            select: { email: true }
        });
        organizations.forEach(org => {
            if (org.email) emails.push(org.email.toLowerCase().trim());
        });

        // 4. Leads are linked to persons, so their emails are already included via persons

        // Remove duplicates and empty strings
        const uniqueEmails = [...new Set(emails)].filter(e => e && e.length > 0);

        console.log(`[CRM Contacts] Found ${uniqueEmails.length} unique contact emails`);
        return uniqueEmails;
    } catch (error) {
        console.error('[CRM Contacts] Error fetching contact emails:', error);
        return [];
    }
}

/**
 * Check if an email address belongs to a CRM contact
 */
export async function isEmailInCRM(email: string, userId: number): Promise<boolean> {
    if (!email) return false;

    const normalizedEmail = email.toLowerCase().trim();
    const crmEmails = await getCRMContactEmails(userId);

    return crmEmails.includes(normalizedEmail);
}

/**
 * Check if any email in an array belongs to CRM contacts
 */
export async function hasAnyCRMEmail(emails: string[], userId: number): Promise<boolean> {
    if (!emails || emails.length === 0) return false;

    const crmEmails = await getCRMContactEmails(userId);
    const normalizedEmails = emails.map(e => e.toLowerCase().trim());

    return normalizedEmails.some(email => crmEmails.includes(email));
}
