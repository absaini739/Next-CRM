"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
