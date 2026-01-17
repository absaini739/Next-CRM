# 🚀 How to Run Laravel CRM Next

## ✨ One Command to Rule Them All

```bash
npm run dev
```

That's it! This single command will:

1. 🗄️ **Start Database** - PostgreSQL & Redis containers
2. 🔧 **Start Backend API** - Express server on port 3001
3. 🌐 **Start Frontend** - Next.js app on port 3000

### What You'll See:

```
🔍 Starting database containers...
laravel-crm-db
laravel-crm-redis
⏳ Waiting for database...
✅ Database ready! Starting servers...

[0] > api@1.0.0 dev
[0] > nodemon src/index.ts
[0] ✅ Server is running at http://localhost:3001

[1] > web@0.1.0 dev
[1] > next dev
[1] ✓ Ready in 622ms
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🎯 Additional Commands

### Check Database Status
```bash
npm run start-db
# or
podman ps
```

### Stop Everything
Press `Ctrl+C` in the terminal running `npm run dev`

### Stop Database Only
```bash
podman stop laravel-crm-db laravel-crm-redis
```

### View Database Logs
```bash
podman logs laravel-crm-db
```

### Run Migrations
```bash
cd apps/api
npx prisma migrate deploy
```

### Seed Database
```bash
cd apps/api
npx tsx prisma/seed.ts
```

## 🔄 Auto-Start on System Boot

Your database containers are configured to auto-start when you boot your system, so:

✅ **After system restart**: Just run `npm run dev`
✅ **No manual database starting needed**
✅ **Everything works seamlessly**

## 📦 What's Running?

When you execute `npm run dev`:

| Component | Port | Status |
|-----------|------|--------|
| PostgreSQL | 5432 | Auto-starts before API |
| Redis | 6379 | Auto-starts before API |
| API Server | 3001 | Starts after database |
| Frontend | 3000 | Starts simultaneously |

## 🛠️ Troubleshooting

### Database Connection Error?

1. Check if containers are running:
   ```bash
   podman ps | grep laravel-crm
   ```

2. Manually start if needed:
   ```bash
   npm run start-db
   ```

3. Verify connection:
   ```bash
   pg_isready -h localhost -p 5432 -U postgres
   ```

### Port Already in Use?

If you see "port already in use" errors:

```bash
# Check what's using the port
sudo lsof -i :3000  # Frontend
sudo lsof -i :3001  # Backend
sudo lsof -i :5432  # PostgreSQL

# Kill the process or stop existing servers
```

### API Server Not Starting?

Make sure you have all dependencies:
```bash
npm install
```

## 💡 Tips

- **Development Mode**: Hot reload is enabled for both frontend and backend
- **Database Persistence**: Your data persists across restarts
- **Logs**: All output appears in the same terminal
- **Restart Servers**: Type `rs` in the terminal to restart nodemon

## 📚 More Documentation

- [DATABASE.md](./DATABASE.md) - Database management details
- [FIX_SUMMARY.md](./FIX_SUMMARY.md) - Auto-start configuration
- [QUICKSTART.md](./QUICKSTART.md) - Initial setup guide

---

**Happy Coding! 🎉**
