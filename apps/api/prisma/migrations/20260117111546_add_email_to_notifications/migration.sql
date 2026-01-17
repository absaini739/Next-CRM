-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "product_interest" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "email_id" INTEGER,
ADD COLUMN     "lead_id" INTEGER;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "email_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
