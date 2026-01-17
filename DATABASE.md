# Database Management Guide

## Problem Fixed ✅

Your PostgreSQL and Redis containers now auto-start on system boot!

## What Was Done

1. **Created systemd services** for both containers
2. **Enabled auto-start** on system boot
3. **Added predev script** to ensure containers are running before dev starts
4. **Created convenience script** for manual starting

## Automatic Startup (Recommended)

The containers will now automatically start when you boot your system. No action needed!

### Verify Auto-Start

```bash
systemctl --user status container-laravel-crm-db.service
systemctl --user status container-laravel-crm-redis.service
```

## Manual Management

### Quick Start (If Needed)

```bash
npm run start-db
# OR
./start-db.sh
# OR
podman start laravel-crm-db laravel-crm-redis
```

### Check Status

```bash
podman ps
```

### Stop Containers

```bash
podman stop laravel-crm-db laravel-crm-redis
```

### View Logs

```bash
podman logs laravel-crm-db
podman logs laravel-crm-redis
```

## Running Your App

Just run as normal - the predev script will ensure containers are running:

```bash
npm run dev
```

## Troubleshooting

### Containers Not Starting Automatically?

1. Check systemd services:
   ```bash
   systemctl --user status container-laravel-crm-db.service
   ```

2. Restart services manually:
   ```bash
   systemctl --user restart container-laravel-crm-db.service
   systemctl --user restart container-laravel-crm-redis.service
   ```

3. Check logs:
   ```bash
   journalctl --user -u container-laravel-crm-db.service -n 50
   ```

### Still Getting Database Connection Errors?

1. Ensure containers are running:
   ```bash
   podman ps | grep laravel-crm
   ```

2. Test database connection:
   ```bash
   podman exec -it laravel-crm-db psql -U postgres -d laravel_crm_next
   ```

3. Check your .env file has correct database settings:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/laravel_crm_next"
   ```

## Container Details

- **PostgreSQL**: `localhost:5432`
  - User: `postgres`
  - Password: `postgres`
  - Database: `laravel_crm_next`

- **Redis**: `localhost:6379`

## Disable Auto-Start (If Needed)

If you want to disable auto-start:

```bash
systemctl --user disable container-laravel-crm-db.service
systemctl --user disable container-laravel-crm-redis.service
```

## Re-enable Auto-Start

```bash
systemctl --user enable container-laravel-crm-db.service
systemctl --user enable container-laravel-crm-redis.service
```
