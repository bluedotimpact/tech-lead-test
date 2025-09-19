# SWE Lead Test - Setup Guide

## 🚀 Quick Setup

> **Note:** This project now uses Docker for both Node.js (v22) and PostgreSQL to ensure consistent development environments. No local Node.js installation is required!

### What You'll Get
- **Web Application**: Available at http://localhost:3000
- **Database**: PostgreSQL running on port 5432
- **Automatic Setup**: Database tables and seed data loaded automatically
- **Live Development**: Hot reload and console logs visible in terminal

### Step 1: Check Docker Installation

First, check if Docker is already installed:
```bash
docker --version
```

**If you see a version number** → Skip to Step 2  
**If command not found** → Install Docker below:

**macOS (using Homebrew):**
```bash
brew install --cask docker
# Wait for installation to complete, then start Docker:
open /Applications/Docker.app
# Wait ~30 seconds for Docker to fully start
```

**Windows (using winget):**
```powershell
winget install Docker.DockerDesktop
```
After installation, start Docker Desktop from the Start menu.

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Ensure Docker is Running

**macOS/Windows:** Make sure Docker Desktop is running (check for the whale icon in your system tray/menu bar)

**Linux:** Check if Docker daemon is running:
```bash
sudo systemctl status docker
# If not running:
sudo systemctl start docker
```

### Step 3: Start Application and Database

**Option A: Run with live logs (Recommended for development)**
```bash
# Shows all output in your terminal
docker-compose up --build
```

**What happens automatically:**
1. Downloads Node.js 22 Alpine image (~50MB) and PostgreSQL image (~160MB)
2. Installs npm dependencies
3. Waits for PostgreSQL to be ready
4. **Automatically runs database setup** (creates tables and seeds data)
5. Starts the Next.js development server

### Step 4: Verify Running
```bash
docker ps
```
You should see both containers running:
- `swe-lead-app` - Node.js application on port 3000
- `swe-lead-postgres` - PostgreSQL database on port 5432

### Step 5: View Your Application

**Open your web browser and go to: http://localhost:3000**

You should see the application running with a display like this:

![Database Success](./public/sucess.png)

The image confirms:
- tRPC is working correctly (You can just use nextjs routes instead if you'd like)
- Database connection is successful  
- Tables have non-zero row counts (Courses: 1, Units: 6, Exercises: 18)

## 📊 Database Details

The database connection is automatically configured based on your environment:

**When using Docker (recommended):**
- The app container connects to `postgres` hostname (handled automatically)

**When running locally:**
- Ensure `.env.local` exists with `DATABASE_URL=postgresql://postgres:password@localhost:5432/swe_lead_dev`

| Field    | Value         |
|----------|---------------|
| Host     | postgres (Docker) / localhost (local) |
| Port     | 5432          |
| Database | swe_lead_dev  |
| Username | postgres      |
| Password | password      |

## 🔍 View Database with Drizzle Studio

Drizzle Studio provides a visual UI to browse and manage your database:

```bash
# Run Drizzle Studio inside the Docker container
docker exec -it swe-lead-app npm run db:studio
```

This will open Drizzle Studio at `https://local.drizzle.studio` where you can:
- Browse all tables and their data
- Run queries
- View relationships between tables
- Make direct edits to the data (use with caution!)

## 🔧 Troubleshooting

### Windows Users: "exec /usr/local/bin/docker-entrypoint.sh: no such file or directory"

This error occurs when Git converts line endings to Windows format (CRLF). To fix:

**Option 1: Fresh clone with correct line endings**
```bash
# Configure git to preserve LF line endings
git config --global core.autocrlf input

# Remove the current directory and clone again
cd ..
rm -rf swe-lead-test
git clone <repository-url>
cd swe-lead-test
docker-compose up --build
```

**Option 2: Rebuild containers (the Dockerfile now auto-fixes line endings)**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Can't access http://localhost:3000?

1. **Check if containers are running:**
   ```bash
   docker ps
   ```
   You should see both `swe-lead-app` and `swe-lead-postgres` running.

2. **Check application logs:**
   ```bash
   docker-compose logs app
   ```
   Look for "ready - started server on 0.0.0.0:3000" message.

3. **Wait for initialization:**
   The first start takes 1-2 minutes to:
   - Install dependencies
   - Set up the database
   - Start the development server
   
4. **Try without detached mode to see live output:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```
   This shows all logs in real-time so you can see exactly what's happening.

## 🛠️ Docker Commands

### Basic Operations
```bash
# Start with live logs (see all console output)
docker-compose up --build

# Start in background
docker-compose up -d --build

# View application logs (real-time)
docker-compose logs -f app

# View last 100 lines of logs
docker-compose logs --tail=100 app

# Stop all services
docker-compose down

# Access container shell
docker exec -it swe-lead-app sh
```

### Database Operations
```bash
# Manually reset and seed database (this runs automatically on container start)
docker exec -it swe-lead-app npm run db:fresh

# Open Drizzle Studio
docker exec -it swe-lead-app npm run db:studio
```

### Local Development (Without Docker)
If you prefer to run Node.js locally while using Docker only for PostgreSQL:
```bash
# Start only the database
docker-compose up -d postgres

# Install dependencies locally
npm install

# Set up and seed the database
npm run db:fresh

# Run the app locally
npm run dev
```

## Cleanup
```bash
# Stop all containers
docker-compose down

# Stop and delete all data (including database volumes)
docker-compose down -v
```