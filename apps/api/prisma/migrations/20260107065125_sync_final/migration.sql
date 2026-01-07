-- AlterTable
ALTER TABLE "email_attachments" ALTER COLUMN "file_path" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lead_sources" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lead_stages" ALTER COLUMN "pipeline_id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lead_types" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "quote_items" ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "quotes" ALTER COLUMN "quote_number" DROP DEFAULT;
