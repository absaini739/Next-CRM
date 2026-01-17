-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "lead_score" INTEGER DEFAULT 0,
ADD COLUMN     "tags" JSONB;
