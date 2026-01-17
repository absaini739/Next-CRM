
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leads';
    `;
        console.log('Columns in leads table:', result);
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
