/*
  Warnings:

  - You are about to drop the column `closed_at` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `lead_pipeline_id` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `lead_pipeline_stage_id` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `lead_source_id` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `lead_type_id` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `lost_reason` on the `deals` table. All the data in the column will be lost.
  - You are about to alter the column `deal_value` on the `deals` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to drop the column `filepath` on the `email_attachments` table. All the data in the column will be lost.
  - You are about to drop the column `filesize` on the `email_attachments` table. All the data in the column will be lost.
  - You are about to drop the column `mimetype` on the `email_attachments` table. All the data in the column will be lost.
  - You are about to drop the column `has_attachments` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `rotten_days` on the `lead_pipelines` table. All the data in the column will be lost.
  - You are about to drop the column `closed_at` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `lead_pipeline_id` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `lead_stage_id` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `lost_reason` on the `leads` table. All the data in the column will be lost.
  - You are about to alter the column `lead_value` on the `leads` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to drop the column `coupon_code` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `discount_amount` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `discount_percent` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `tax_amount` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `tax_percent` on the `quote_items` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `quote_items` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `quote_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to drop the column `adjustment_amount` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `billing_address` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `discount_percent` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `expired_at` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address` on the `quotes` table. All the data in the column will be lost.
  - You are about to alter the column `discount_amount` on the `quotes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to alter the column `tax_amount` on the `quotes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to alter the column `sub_total` on the `quotes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to alter the column `grand_total` on the `quotes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Decimal(10,2)`.
  - You are about to drop the `lead_pipeline_stages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[quote_number]` on the table `quotes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_path` to the `email_attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lead_sources` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pipeline_id` to the `lead_stages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lead_stages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lead_types` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amount` to the `quote_items` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `quote_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `quote_number` to the `quotes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_lead_pipeline_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_lead_pipeline_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_lead_source_id_fkey";

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT "deals_lead_type_id_fkey";

-- DropForeignKey
ALTER TABLE "lead_pipeline_stages" DROP CONSTRAINT "lead_pipeline_stages_lead_pipeline_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_lead_pipeline_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_lead_source_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_lead_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_lead_type_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_person_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_quote_id_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_person_id_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_user_id_fkey";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "organization_id" INTEGER;

-- AlterTable
ALTER TABLE "deals" DROP COLUMN "closed_at",
DROP COLUMN "lead_pipeline_id",
DROP COLUMN "lead_pipeline_stage_id",
DROP COLUMN "lead_source_id",
DROP COLUMN "lead_type_id",
DROP COLUMN "lost_reason",
ADD COLUMN     "organization_id" INTEGER,
ADD COLUMN     "pipeline_id" INTEGER,
ADD COLUMN     "stage_id" INTEGER,
ALTER COLUMN "deal_value" DROP NOT NULL,
ALTER COLUMN "deal_value" DROP DEFAULT,
ALTER COLUMN "deal_value" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "expected_close_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "email_attachments" DROP COLUMN "filepath",
DROP COLUMN "filesize",
DROP COLUMN "mimetype",
ADD COLUMN     "file_path" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "mime_type" TEXT;

-- AlterTable
ALTER TABLE "emails" DROP COLUMN "has_attachments";

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "lead_pipelines" DROP COLUMN "rotten_days";

-- AlterTable
ALTER TABLE "lead_sources" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "lead_stages" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pipeline_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "probability" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "lead_types" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "closed_at",
DROP COLUMN "lead_pipeline_id",
DROP COLUMN "lead_stage_id",
DROP COLUMN "lost_reason",
ADD COLUMN     "organization_id" INTEGER,
ADD COLUMN     "pipeline_id" INTEGER,
ADD COLUMN     "stage_id" INTEGER,
ALTER COLUMN "lead_value" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "person_id" DROP NOT NULL,
ALTER COLUMN "lead_source_id" DROP NOT NULL,
ALTER COLUMN "lead_type_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "quote_items" DROP COLUMN "coupon_code",
DROP COLUMN "discount_amount",
DROP COLUMN "discount_percent",
DROP COLUMN "name",
DROP COLUMN "sku",
DROP COLUMN "tax_amount",
DROP COLUMN "tax_percent",
DROP COLUMN "total",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discount" DECIMAL(10,2),
ADD COLUMN     "tax" DECIMAL(10,2),
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "product_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quotes" DROP COLUMN "adjustment_amount",
DROP COLUMN "billing_address",
DROP COLUMN "discount_percent",
DROP COLUMN "expired_at",
DROP COLUMN "shipping_address",
ADD COLUMN     "adjustment" DECIMAL(10,2),
ADD COLUMN     "deal_id" INTEGER,
ADD COLUMN     "lead_id" INTEGER,
ADD COLUMN     "organization_id" INTEGER,
ADD COLUMN     "quote_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "valid_until" TIMESTAMP(3),
ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "discount_amount" DROP DEFAULT,
ALTER COLUMN "discount_amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tax_amount" DROP DEFAULT,
ALTER COLUMN "tax_amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "sub_total" DROP DEFAULT,
ALTER COLUMN "sub_total" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "grand_total" DROP DEFAULT,
ALTER COLUMN "grand_total" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "person_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- DropTable
DROP TABLE "lead_pipeline_stages";

-- CreateTable
CREATE TABLE "deal_pipelines" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_stages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pipeline_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "task_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'to_do',
    "due_date" TIMESTAMP(3),
    "due_time" TEXT,
    "estimated_duration" INTEGER,
    "actual_duration" INTEGER,
    "assigned_to_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "person_id" INTEGER,
    "organization_id" INTEGER,
    "lead_id" INTEGER,
    "deal_id" INTEGER,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_pattern" TEXT,
    "recurrence_end_date" TIMESTAMP(3),
    "parent_task_id" INTEGER,
    "tags" JSONB,
    "attachments" JSONB,
    "checklist" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_time_logs" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "note" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER,
    "person_id" INTEGER,
    "organization_id" INTEGER,
    "lead_id" INTEGER,
    "deal_id" INTEGER,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_pattern" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quote_number_key" ON "quotes"("quote_number");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "lead_pipelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "lead_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_lead_source_id_fkey" FOREIGN KEY ("lead_source_id") REFERENCES "lead_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_lead_type_id_fkey" FOREIGN KEY ("lead_type_id") REFERENCES "lead_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_stages" ADD CONSTRAINT "lead_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "lead_pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "deal_pipelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "deal_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stages" ADD CONSTRAINT "deal_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "deal_pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_time_logs" ADD CONSTRAINT "task_time_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_time_logs" ADD CONSTRAINT "task_time_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
