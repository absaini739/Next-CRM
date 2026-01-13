
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting password for ${email}...`);

    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });

    console.log('Password reset successfully for:', user.email);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
