#!/bin/bash

echo "🔍 DIAGNOSTIC CHECK: Comparing PostgreSQL Instances..."
echo "---------------------------------------------------"
echo "1. SOCKET Connection (System Default):"
sudo -u postgres psql -c "SHOW data_directory;"

echo "2. TCP Connection (127.0.0.1:5432):"
# Attempt to connect via TCP and show directory
PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d postgres -c "SHOW data_directory;" || echo "⚠️ TCP Connection Failed"
echo "---------------------------------------------------"
echo ""

echo "🛑 Stopping conflicting containers..."
podman stop ispecia-crm-db 2>/dev/null || true

echo "🗑️ Dropping existing database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ispecia_crm;"
sudo -u postgres psql -c "CREATE DATABASE ispecia_crm OWNER postgres;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ispecia_crm TO postgres;"
sudo -u postgres psql -d ispecia_crm -c "GRANT ALL ON SCHEMA public TO postgres;"
sudo -u postgres psql -d ispecia_crm -c "ALTER SCHEMA public OWNER TO postgres;"
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/ispecia_crm?schema=public"
npx prisma migrate dev --name init

echo "🌱 Seeding Database (TCP)..."
npx tsx prisma/seed.ts

echo "✅ Done! Check the DIAGNOSTIC section at the top."
