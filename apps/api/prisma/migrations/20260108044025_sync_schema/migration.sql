-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "scheduled_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "voip_providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "account_sid" TEXT,
    "auth_token" TEXT,
    "api_key_sid" TEXT,
    "api_key_secret" TEXT,
    "twiml_app_sid" TEXT,
    "api_key" TEXT,
    "connection_id" TEXT,
    "webhook_secret" TEXT,
    "sip_server" TEXT,
    "sip_port" INTEGER,
    "sip_username" TEXT,
    "sip_password" TEXT,
    "transport" TEXT,
    "from_number" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voip_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voip_trunks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "sip_domain" TEXT NOT NULL,
    "sip_port" INTEGER NOT NULL DEFAULT 5060,
    "transport_protocol" TEXT NOT NULL DEFAULT 'UDP',
    "auth_method" TEXT NOT NULL DEFAULT 'username',
    "sip_username" TEXT,
    "sip_password" TEXT,
    "registration_required" BOOLEAN NOT NULL DEFAULT false,
    "options_context" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voip_trunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_routes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "did_pattern" TEXT NOT NULL,
    "destination_type" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "trunk_id" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_recordings" (
    "id" SERIAL NOT NULL,
    "recording_sid" TEXT NOT NULL,
    "from_number" TEXT NOT NULL,
    "to_number" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "user_id" INTEGER,
    "duration" INTEGER NOT NULL,
    "recording_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_recordings_recording_sid_key" ON "call_recordings"("recording_sid");

-- AddForeignKey
ALTER TABLE "voip_trunks" ADD CONSTRAINT "voip_trunks_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "voip_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_trunk_id_fkey" FOREIGN KEY ("trunk_id") REFERENCES "voip_trunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
