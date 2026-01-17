#!/bin/bash
# Start database containers for Laravel CRM

echo "🔍 Checking container status..."
podman ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "laravel-crm"

echo ""
echo "🚀 Starting containers..."
podman start laravel-crm-db laravel-crm-redis

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

echo ""
echo "✅ Containers status:"
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✨ Database is ready!"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
