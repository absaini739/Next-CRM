-- Database Performance Optimization Migration
-- Add indexes to frequently queried columns

-- Email Messages - Most frequently queried table
CREATE INDEX IF NOT EXISTS "idx_email_messages_account_id" ON "email_messages"("account_id");
CREATE INDEX IF NOT EXISTS "idx_email_messages_folder" ON "email_messages"("folder");
CREATE INDEX IF NOT EXISTS "idx_email_messages_is_read" ON "email_messages"("is_read");
CREATE INDEX IF NOT EXISTS "idx_email_messages_person_id" ON "email_messages"("person_id");
CREATE INDEX IF NOT EXISTS "idx_email_messages_lead_id" ON "email_messages"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_email_messages_deal_id" ON "email_messages"("deal_id");
CREATE INDEX IF NOT EXISTS "idx_email_messages_created_at" ON "email_messages"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_email_messages_sent_at" ON "email_messages"("sent_at" DESC);

-- Email Accounts
CREATE INDEX IF NOT EXISTS "idx_email_accounts_user_id" ON "email_accounts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_accounts_provider" ON "email_accounts"("provider");
CREATE INDEX IF NOT EXISTS "idx_email_accounts_is_default" ON "email_accounts"("is_default");

-- Email Tracking
CREATE INDEX IF NOT EXISTS "idx_email_tracking_message_id" ON "email_tracking"("message_id");
CREATE INDEX IF NOT EXISTS "idx_email_tracking_event_type" ON "email_tracking"("event_type");
CREATE INDEX IF NOT EXISTS "idx_email_tracking_created_at" ON "email_tracking"("created_at" DESC);

-- Email Templates
CREATE INDEX IF NOT EXISTS "idx_email_templates_user_id" ON "email_templates"("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_templates_is_active" ON "email_templates"("is_active");

-- Persons (for CRM email lookup)
CREATE INDEX IF NOT EXISTS "idx_persons_user_id" ON "persons"("user_id");
CREATE INDEX IF NOT EXISTS "idx_persons_organization_id" ON "persons"("organization_id");

-- Leads (for email matching)
CREATE INDEX IF NOT EXISTS "idx_leads_primary_email" ON "leads"("primary_email");
CREATE INDEX IF NOT EXISTS "idx_leads_secondary_email" ON "leads"("secondary_email");
CREATE INDEX IF NOT EXISTS "idx_leads_user_id" ON "leads"("user_id");

-- Deals (for CRM integration)
CREATE INDEX IF NOT EXISTS "idx_deals_person_id" ON "deals"("person_id");
CREATE INDEX IF NOT EXISTS "idx_deals_lead_id" ON "deals"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_deals_user_id" ON "deals"("user_id");

-- Organizations (for email matching)
CREATE INDEX IF NOT EXISTS "idx_organizations_email" ON "organizations"("email");
CREATE INDEX IF NOT EXISTS "idx_organizations_user_id" ON "organizations"("user_id");

-- Tasks
CREATE INDEX IF NOT EXISTS "idx_tasks_assigned_to_user_id" ON "tasks"("assigned_to_user_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_status" ON "tasks"("status");
CREATE INDEX IF NOT EXISTS "idx_tasks_due_date" ON "tasks"("due_date");

-- Activities
CREATE INDEX IF NOT EXISTS "idx_activities_person_id" ON "activities"("person_id");
CREATE INDEX IF NOT EXISTS "idx_activities_deal_id" ON "activities"("deal_id");
CREATE INDEX IF NOT EXISTS "idx_activities_due_date" ON "activities"("due_date");

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_email_messages_account_folder" ON "email_messages"("account_id", "folder");
CREATE INDEX IF NOT EXISTS "idx_email_messages_person_sent" ON "email_messages"("person_id", "sent_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_email_messages_lead_sent" ON "email_messages"("lead_id", "sent_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_email_messages_deal_sent" ON "email_messages"("deal_id", "sent_at" DESC);
