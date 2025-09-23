# Setup Guide [5 mins]

1. [Install Docker](#step-1-install-docker-)
2. [Install Node.js 22](#step-2-install-nodejs-22)
3. [Start your application](#step-3-start-application)
4. [Test your setup](#step-4-test-your-setup)

# 💻 Setup instructions

## Step 1: Install Docker 🐳

Check if Docker is already installed:

```bash
docker --version
# If you see a version number → Skip to Step 3
# If command not found → Install Docker
```

Follow the instructions for your operating system:

<details>
<summary>macOS/Windows</summary>

1. Go to https://www.docker.com/products/docker-desktop/ and download Docker Desktop for your operating system.
2. After installation, start Docker Desktop and wait for it to fully initialize (~30 seconds).
3. Make sure Docker Desktop is running (check for the whale icon in your system tray/menu bar)
</details>
<details>
<summary>Debian-based linux (including Ubuntu)</summary>

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

Check if Docker daemon is running:

```bash
sudo systemctl status docker
# If not running:
sudo systemctl start docker
```

</details>

## Step 2: Install Node.js 22

Check if you have Node.js installed:

```bash
node --version
# v22.x.x -> Skip installation
```

If you see a version number, visit https://nodejs.org and install Node.js 22 LTS

If you have an older version, you can either:

1. Replace it by visiting https://nodejs.org and installing Node.js 22 LTS
2. Keep both versions using a version manager:
<details>
<summary>macOS/Linux</summary>

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

</details>
<details>
<summary>Windows</summary>

```bash
# Install nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
# Download and run the nvm-setup.exe installer

# After installation, in a new terminal:
nvm install 22
nvm use 22
```

</details>

3. Install VS Code Dev Container
<details>
<summary>Instructions</summary>

1. Install the "Dev Containers" extension in VS Code
1. Open this project in VS Code by clicking "Reopen in Container" when prompted (or press F1 and search for "Dev Containers: Reopen in Container")
   - VS Code will build the container, install dependencies and set up the database independently
   - Once ready, you'll see "✅ Dev container ready!" in the terminal
1. Run `npm run dev` in the VS Code terminal
1. You can skip [Step 3: Start application](#step-3-start-application) and open http://localhost:3000 in your browser
</details>

## Step 3: Start your application

```bash
# Start PostgreSQL
docker-compose up

# In a new terminal:
npm install  # This installs all dependencies including tsx (used for TypeScript execution)
npm run db:fresh  # IMPORTANT: This initializes database tables AND seeds test data
npm run dev
```

## Step 4: Test your setup

You should see the application with a successful database connectionand tables with non-zero row counts at http://localhost:3000:
[insert image]

View and manage the database from Drizzle Studio

```bash
# Run Drizzle Studio
npm run db:studio
```

After completing the test, clean up Docker:

```bash
# Stop all containers
docker-compose down

# Stop and delete all data (including database volumes)
docker-compose down -v
```

## 🎉 You've completed the setup and are ready to start the work test!

# 🔧 Troubleshooting

<details>
<summary>Database connection error when loading http://localhost:3000</summary>

verify PostgreSQL is running:

```bash
docker ps  # Should show tech-lead-postgres container running
```

</details>

<details>
<summary>Windows Users: `exec /usr/local/bin/docker-entrypoint.sh: no such file or directory`</summary>

This error occurs when Git converts line endings to Windows format (CRLF). To fix:

Option 1: Fresh clone with correct line endings

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

Option 2: Rebuild containers (the Dockerfile now auto-fixes line endings)

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

</details>

<details>
<summmary>Can't access http://localhost:3000?</summary>

1. Check if containers are running:

```bash
docker ps
```

You should see both `swe-lead-app` and `swe-lead-postgres` running.

2. Check application logs:

```bash
docker-compose logs app
```

Look for `"ready - started server on 0.0.0.0:3000"` message.

3. Wait for initialization: The first start takes a few minutes to:
   - Install dependencies
   - Set up the database
   - Start the development server

4. Try without detached mode to see live output:

```bash
docker-compose down
docker-compose up --build
```

This shows all logs in real-time so you can see exactly what's happening.

</details>

<details> 
<summary>Reset database and re-seed with test data</summary>

```bash
npm run db:fresh
```

</details>

<details>
<summary>Run database seeding only (without resetting schema)</summary>

```bash
npm run db:seed
```

</details>
