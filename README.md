# SWE Lead Test - Setup Guide

## Success Criteria

**You're all set when you can:**

- Access http://localhost:3000
- See the database connection is successful
- See tables with non-zero row counts

Don't worry about following every step if you already have the tools installed, just get to a working state.

The original work instructions might mention steps 1-5, but as long as you've matched the sucess criteria, you're good to go.

## Development Options

### Option A: Local Node.js (Use Node 22 LTS)

**Requirements:** Node.js 22 + Docker Desktop  
**Benefits:** Natural IntelliSense, simpler workflow

### Option B: VS Code Dev Containers

**Requirements:** VS Code + Docker Desktop  
**Benefits:** No Node.js installation needed, fully containerized

---

## Option A: Local Node.js Setup

### Step 1: Install Node.js 22

**Option A: Direct installation (Simplest)**
Visit https://nodejs.org and install Node.js 22 LTS

**Option B: Using version manager (If you already ahve node installed)**

**macOS/Linux:**

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# OR if you don't have curl:
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your terminal or run:
source ~/.bashrc  # or ~/.zshrc for zsh users

# Install and use Node 22
nvm install 22
nvm use 22
```

**Windows:**

```powershell
# Install nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
# Download and run the nvm-setup.exe installer

# After installation, in a new terminal:
nvm install 22
nvm use 22
```

### Step 2: Check Docker Installation

Check if Docker is already installed:

```bash
docker --version
```

**If you see a version number** → Skip to Step 3  
**If command not found** → Install Docker below:

**macOS/Windows:**
Go to https://www.docker.com/products/docker-desktop/ and download Docker Desktop for your operating system.
After installation, start Docker Desktop and wait for it to fully initialize (~30 seconds).

**Ubuntu/Debian:**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 3: Ensure Docker is Running

**macOS/Windows:** Make sure Docker Desktop is running (check for the whale icon in your system tray/menu bar)

**Linux:** Check if Docker daemon is running:

```bash
sudo systemctl status docker
# If not running:
sudo systemctl start docker
```

### Step 4: Start Application

```bash
# Start PostgreSQL
docker-compose up

# In a new terminal:
npm install  # This installs all dependencies including tsx (used for TypeScript execution)
npm run db:fresh  # IMPORTANT: This initializes database tables AND seeds test data
npm run dev
```

**Note:** The `db:fresh` command runs three operations:

1. Initializes database schema (`db-init.ts`)
2. Seeds the database with test data (`db:seed`)
3. Verifies the data was loaded correctly (`verify.ts`)

The application will be available at http://localhost:3000

**Troubleshooting:** If you see a database connection error when loading http://localhost:3000, verify PostgreSQL is running:

```bash
docker ps  # Should show swe-lead-postgres container running
```

---

## Option B: VS Code Dev Containers Setup

### Step 1: Install VS Code Extension

Install the "Dev Containers" extension in VS Code

### Step 2: Open in Container

1. Open this project in VS Code
2. When prompted, click "Reopen in Container" (or press F1 and search for "Dev Containers: Reopen in Container")
3. VS Code will build the container and set up everything automatically

### Step 3: Start Development & Verify

1. The container automatically installs dependencies and sets up the database
2. Once ready, you'll see "✅ Dev container ready!" in the terminal
3. Run `npm run dev` in the VS Code terminal
4. Open http://localhost:3000 in your browser

You should see the application with a successful database connection:

![Database Success](./public/sucess.png)

- Tables have non-zero row counts

## 📊 Database Details

The database connection is automatically configured based on your environment:

**When using Docker (recommended):**

- The app container connects to `postgres` hostname (handled automatically)

**When running locally:**

- The `.env.local` file is already included in the repository with the correct database URL

| Field    | Value                                 |
| -------- | ------------------------------------- |
| Host     | postgres (Docker) / localhost (local) |
| Port     | 5432                                  |
| Database | swe_lead_dev                          |
| Username | postgres                              |
| Password | password                              |

## 🔍 View Database with Drizzle Studio

Drizzle Studio provides a visual UI to browse and manage your database:

```bash
# Run Drizzle Studio
npm run db:studio
```

Once Drizzle Studio is running, you can:

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
   The first start takes a few minutes to:
   - Install dependencies
   - Set up the database
   - Start the development server
4. **Try without detached mode to see live output:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```
   This shows all logs in real-time so you can see exactly what's happening.

### Database Operations

```bash
# Reset database and re-seed with test data
npm run db:fresh

# Run seeding only (without resetting schema)
npm run db:seed

# Open Drizzle Studio
npm run db:studio
```

## Cleanup

```bash
# Stop all containers
docker-compose down

# Stop and delete all data (including database volumes)
docker-compose down -v
```
