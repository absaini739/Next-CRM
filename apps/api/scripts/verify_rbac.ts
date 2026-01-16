import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRBAC() {
    console.log('🚀 Starting RBAC Verification Tasks...');

    try {
        // 1. Fetch our seeded hierarchy users
        const admin = await prisma.user.findFirst({ where: { email: 'admin@ispecia.com' }, include: { role: true } });
        const manager = await prisma.user.findFirst({ where: { email: 'manager@ispecia.com' }, include: { role: true } });
        const lead = await prisma.user.findFirst({ where: { email: 'lead@ispecia.com' }, include: { role: true } });
        const employee = await prisma.user.findFirst({ where: { email: 'employee@ispecia.com' }, include: { role: true } });

        if (!admin || !manager || !lead || !employee) {
            console.error('❌ Could not find seeded users. Please run seed script first.');
            return;
        }

        console.log(`✅ Found Users: Admin(${admin.id}), Manager(${manager.id}), Lead(${lead.id}), Employee(${employee.id})`);

        // 2. Test Task Creation with Hierarchy (Internal Logic Check)
        // Note: Real validation happens in controller, here we check if Prisma properties are correct
        console.log('\n--- Testing Hierarchy Links ---');
        console.log(`Lead reports to Manager? ${lead.reports_to_id === manager.id ? 'YES' : 'NO'}`);
        console.log(`Employee reports to Lead? ${employee.reports_to_id === lead.id ? 'YES' : 'NO'}`);

        // 3. Verify Notification Persistence
        console.log('\n--- Verifying Notification Creation ---');
        const testNotif = await prisma.notification.create({
            data: {
                user_id: employee.id,
                message: 'Test RBAC Notification',
            }
        });
        console.log(`✅ Notification created for Employee: ${testNotif.id}`);

        // 4. Cleanup test data
        await prisma.notification.delete({ where: { id: testNotif.id } });
        console.log('✅ Cleanup successful.');

        console.log('\n🚀 Verification script completed.');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyRBAC();
