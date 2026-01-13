"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Roles ---');
    const roles = await prisma.role.findMany();
    console.log(roles);
    console.log('\n--- Users ---');
    const users = await prisma.user.findMany({
        include: { role: true }
    });
    console.log(users);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
