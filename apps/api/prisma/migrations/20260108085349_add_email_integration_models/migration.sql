-- CreateTable
CREATE TABLE "email_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expiry" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sync_from_date" TIMESTAMP(3),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,
    "provider_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_messages" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "thread_id" INTEGER,
    "message_id" TEXT NOT NULL,
    "in_reply_to" TEXT,
    "references" JSONB,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT,
    "to" JSONB NOT NULL,
    "cc" JSONB,
    "bcc" JSONB,
    "subject" TEXT NOT NULL,
    "body_text" TEXT,
    "body_html" TEXT,
    "snippet" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'inbox',
    "labels" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "has_attachments" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "person_id" INTEGER,
    "lead_id" INTEGER,
    "deal_id" INTEGER,
    "sent_from_crm" BOOLEAN NOT NULL DEFAULT false,
    "sent_from_account_id" INTEGER,
    "tracking_enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_threads" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "participant_emails" JSONB NOT NULL,
    "last_message_at" TIMESTAMP(3) NOT NULL,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_message_attachments" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_path" TEXT,
    "inline" BOOLEAN NOT NULL DEFAULT false,
    "content_id" TEXT,
    "attachment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_tracking" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "link_url" TEXT,
    "country" TEXT,
    "city" TEXT,
    "tracked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_accounts_user_id_email_key" ON "email_accounts"("user_id", "email");

-- CreateIndex
CREATE INDEX "email_messages_account_id_folder_idx" ON "email_messages"("account_id", "folder");

-- CreateIndex
CREATE INDEX "email_messages_thread_id_idx" ON "email_messages"("thread_id");

-- CreateIndex
CREATE INDEX "email_messages_person_id_idx" ON "email_messages"("person_id");

-- CreateIndex
CREATE INDEX "email_messages_lead_id_idx" ON "email_messages"("lead_id");

-- CreateIndex
CREATE INDEX "email_messages_deal_id_idx" ON "email_messages"("deal_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_account_id_message_id_key" ON "email_messages"("account_id", "message_id");

-- CreateIndex
CREATE INDEX "email_tracking_message_id_event_type_idx" ON "email_tracking"("message_id", "event_type");

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "email_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_sent_from_account_id_fkey" FOREIGN KEY ("sent_from_account_id") REFERENCES "email_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "email_threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_message_attachments" ADD CONSTRAINT "email_message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "email_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking" ADD CONSTRAINT "email_tracking_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "email_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
