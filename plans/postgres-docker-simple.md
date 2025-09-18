# PostgreSQL Docker Setup Plan

## Overview
Add a PostgreSQL Docker container to the existing Next.js project with Drizzle ORM for local development.

## 1. Docker Compose Setup

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: swe-lead-postgres
    environment:
      POSTGRES_DB: swe_lead_dev
      POSTGRES_USER: postgres  
      POSTGRES_PASSWORD: ""
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 2. Environment Variables

Update `.env.local` with:

```env
# PostgreSQL Docker connection
# Format: postgresql://[POSTGRES_USER]:[POSTGRES_PASSWORD]@localhost:5432/[POSTGRES_DB]
DATABASE_URL=postgresql://postgres:@localhost:5432/swe_lead_dev

# Enable Drizzle query logging for development
DB_ENABLE_LOGGING=true
```

## 3. Drizzle Connection Integration

The existing Drizzle setup in `src/db/index.ts` will automatically connect to the Docker container using the `DATABASE_URL` environment variable. No code changes needed - the current connection pool configuration is already suitable for local development.

## 4. Basic Commands

**Start the database:**
```bash
docker-compose up -d postgres
```

**Stop the database:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs postgres
```

**Access Drizzle Studio:**
```bash
npm run db:studio
```

**Push schema changes:**
```bash
npm run db:push
```

## 5. Verification

After starting the container:
1. Run `npm run dev` - should see "✅ Successfully connected to PostgreSQL" in console
2. Run `npm run db:studio` - opens Drizzle Studio at http://localhost:4983
3. Run `npm run db:push` - applies schema to the database

The Docker container will persist data in a named volume and automatically restart with the same data.