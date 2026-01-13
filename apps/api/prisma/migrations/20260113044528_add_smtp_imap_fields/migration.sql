-- AlterTable
ALTER TABLE "email_accounts" ADD COLUMN     "connection_type" TEXT DEFAULT 'oauth',
ADD COLUMN     "encrypted_password" TEXT,
ADD COLUMN     "encryption_type" TEXT,
ADD COLUMN     "imap_host" TEXT,
ADD COLUMN     "imap_port" INTEGER,
ADD COLUMN     "imap_username" TEXT,
ADD COLUMN     "smtp_host" TEXT,
ADD COLUMN     "smtp_port" INTEGER,
ADD COLUMN     "smtp_username" TEXT;
