# Next-CRM

A modern CRM application built with Next.js, Express, and PostgreSQL.

## 🚀 Quick Start

Run everything with one command:

```bash
npm run dev
```

This automatically starts:
- 🗄️ Database (PostgreSQL & Redis)
- 🔧 Backend API (http://localhost:3001)
- 🌐 Frontend (http://localhost:3000)

## 📚 Documentation

- **[USAGE.md](./USAGE.md)** - How to run and use the application
- **[DATABASE.md](./DATABASE.md)** - Database management guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Initial setup and configuration
- **[FIX_SUMMARY.md](./FIX_SUMMARY.md)** - Auto-start configuration details

## ✨ Features

- ✅ **One-Command Start** - Everything starts with `npm run dev`
- ✅ **Auto-Start Database** - Containers start automatically on boot
- ✅ **Hot Reload** - Both frontend and backend support hot reload
- ✅ **Modern Stack** - Next.js 16, React, TypeScript, Prisma

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Express, TypeScript, Prisma
- **Database**: PostgreSQL 15, Redis 7
- **Containers**: Podman (Docker-compatible)

## 📦 What Happens When You Run `npm run dev`

1. Database containers start (PostgreSQL + Redis)
2. Backend API server starts on port 3001
3. Frontend Next.js app starts on port 3000
4. Hot reload enabled for both servers

## 🔗 Quick Links

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

---

**No manual database starting required - just run `npm run dev` and start coding!** 🎉
