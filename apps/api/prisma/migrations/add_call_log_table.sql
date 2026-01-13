-- Add CallLog table for tracking all calls
-- Migration: add_call_log_table

CREATE TABLE IF NOT EXISTS "call_logs" (
  "id" SERIAL PRIMARY KEY,
  "call_sid" VARCHAR(255) UNIQUE,
  "provider_id" INTEGER REFERENCES "voip_providers"("id") ON DELETE SET NULL,
  "direction" VARCHAR(20) NOT NULL, -- 'inbound' or 'outbound'
  "from_number" VARCHAR(50) NOT NULL,
  "to_number" VARCHAR(50) NOT NULL,
  "person_id" INTEGER REFERENCES "persons"("id") ON DELETE SET NULL,
  "lead_id" INTEGER REFERENCES "leads"("id") ON DELETE SET NULL,
  "deal_id" INTEGER REFERENCES "deals"("id") ON DELETE SET NULL,
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'initiated', -- initiated, ringing, in-progress, completed, busy, no-answer, failed, canceled
  "duration" INTEGER DEFAULT 0, -- in seconds
  "recording_sid" VARCHAR(255),
  "recording_url" TEXT,
  "started_at" TIMESTAMP,
  "answered_at" TIMESTAMP,
  "ended_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_call_logs_call_sid" ON "call_logs"("call_sid");
CREATE INDEX IF NOT EXISTS "idx_call_logs_provider_id" ON "call_logs"("provider_id");
CREATE INDEX IF NOT EXISTS "idx_call_logs_person_id" ON "call_logs"("person_id");
CREATE INDEX IF NOT EXISTS "idx_call_logs_lead_id" ON "call_logs"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_call_logs_user_id" ON "call_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_call_logs_direction" ON "call_logs"("direction");
CREATE INDEX IF NOT EXISTS "idx_call_logs_status" ON "call_logs"("status");
CREATE INDEX IF NOT EXISTS "idx_call_logs_started_at" ON "call_logs"("started_at" DESC);
