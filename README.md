# SWE Lead Test - Setup Guide

## 🚀 Quick Setup

### Step 1: Check Docker Installation

First, check if Docker is already installed:
```bash
docker --version
```

**✅ If you see a version number** → Skip to Step 2  
**❌ If command not found** → Install Docker below:

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

### Step 3: Start Database
```bash
# From the swe-lead-test directory, it'll download Postgres which might be around 160MB
docker-compose up -d
```

### Step 4: Verify Running
```bash
docker ps
```
You should see `swe-lead-postgres` running on port 5432.

## 📊 Database Details

No need to configure these, by default nextjs and drizzleOrm will assume these

| Field    | Value         |
|----------|---------------|
| Host     | localhost     |
| Port     | 5432          |
| Database | swe_lead_dev  |
| Username | postgres      |
| Password | password      |

## 🌱 Populate Database

After setting up the database, populate it with seed data:

```bash
# Install dependencies if you haven't already
npm install

# Populate database with seed data (drops existing data and recreates)
npm run db:fresh
```

This will:
- Drop all existing tables
- Create fresh tables from the schema
- Seed the database with data from CSV files in `/future-tables`

## 🛑 Cleanup

```bash
# Stop database
docker-compose down

# Stop and delete all data
docker-compose down -v
```