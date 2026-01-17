# 🎉 Next-CRM is Running!

## ✅ Current Status

Your Next-CRM application is **UP and RUNNING**:

- **🌐 Web Interface**: http://localhost:3000
- **🔌 API Server**: http://localhost:3001  
- **🏥 Health Check**: http://localhost:3001/health

**Both servers are operational!** You can start using the application right now.

---

## ✅ Database Setup - AUTO-STARTS ON BOOT!

Your PostgreSQL and Redis containers are **configured to auto-start** on system boot!

### Already Running! 🎉

The database containers are set up with systemd and will automatically start:
- **PostgreSQL**: `localhost:5432` (auto-starts on boot)
- **Redis**: `localhost:6379` (auto-starts on boot)

**No manual starting needed!** Just run `npm run dev` and everything works.

### Manual Control (If Needed)

```bash
# Quick start (if containers stopped)
npm run start-db

# Or manually
podman start laravel-crm-db laravel-crm-redis

# Check status
podman ps | grep laravel-crm

# View systemd status
systemctl --user status container-laravel-crm-db.service
```

### First Time Setup (Already Done!)

If you need to recreate containers:

```bash
# Remove old containers
podman rm -f laravel-crm-db laravel-crm-redis

# Create new containers
podman run -d \
  --name laravel-crm-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=laravel_crm_next \
  -p 5432:5432 \
  -v laravel_crm_postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

podman run -d \
  --name laravel-crm-redis \
  -p 6379:6379 \
  redis:7-alpine

# Re-enable auto-start
cd ~/.config/systemd/user/
podman generate systemd --new --files --name laravel-crm-db
podman generate systemd --new --files --name laravel-crm-redis
systemctl --user daemon-reload
systemctl --user enable container-laravel-crm-db.service
systemctl --user enable container-laravel-crm-redis.service

# Wait for DB to be ready, then run migrations
sleep 10
cd ~/Downloads/laravel-crm-next/apps/api
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

📚 **See [DATABASE.md](./DATABASE.md) for complete database management guide.**

### Option 2: Install PostgreSQL System-Wide

```bash
# Install PostgreSQL
sudo dnf install -y postgresql postgresql-server

# Initialize database cluster
sudo postgresql-setup --initdb

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE laravel_crm_next;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Configure to allow password authentication
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# Run migrations
cd apps/api
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### Option 3: Use Docker Compose

```bash
# Start both PostgreSQL and Redis
docker-compose up -d

# Or with podman
podman-compose up -d

# Run migrations
cd apps/api
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

---

## 🚀 Quick Commands

### Check Application Status
```bash
./check-status.sh
```

### View Logs
```bash
tail -f /tmp/crm-dev-2.log
```

### Restart Servers
```bash
# Stop
pkill -f "npm run dev"

# Start
npm run dev
```

### Stop Database Containers (if using Podman)
```bash
podman stop laravel-crm-db laravel-crm-redis
podman rm laravel-crm-db laravel-crm-redis
```

---

## 📱 What You Can Do Now

**Without Database:**
- Access the web interface
- Test API endpoints
- View the UI/UX

**With Database:**
- Full CRM functionality
- User authentication
- Data persistence
- Email integration
- Background jobs (with Redis)

---

## 🎯 Next Steps

1. **Open your browser** and go to http://localhost:3000
2. **Optionally install PostgreSQL** using one of the methods above
3. **Enjoy your CRM!**

---

**The application is ready to use! 🚀**
