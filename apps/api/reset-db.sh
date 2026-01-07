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
podman stop laravel-crm-db 2>/dev/null || true

echo "🗑️ Dropping existing database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS laravel_crm_next;"

echo "✨ Creating fresh database..."
sudo -u postgres psql -c "CREATE DATABASE laravel_crm_next OWNER postgres;"

echo "🔐 Configuring Superuser & Permissions (SOCKET)..."
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER CREATEDB CREATEROLE REPLICATION;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE laravel_crm_next TO postgres;"

echo "🔎 Fixing Schema Permissions (SOCKET)..."
sudo -u postgres psql -d laravel_crm_next -c "GRANT ALL ON SCHEMA public TO postgres;"
sudo -u postgres psql -d laravel_crm_next -c "ALTER SCHEMA public OWNER TO postgres;"

echo "🔄 Running Migrations (TCP)..."
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/laravel_crm_next?schema=public"
npx prisma migrate dev --name init

echo "🌱 Seeding Database (TCP)..."
npx tsx prisma/seed.ts

echo "✅ Done! Check the DIAGNOSTIC section at the top."
