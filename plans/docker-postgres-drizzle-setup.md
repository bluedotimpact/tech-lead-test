# Docker PostgreSQL Setup with DrizzleORM and Consistent Seeding

## Overview

This plan provides a production-ready development environment that ensures:
- Consistent data across different machines and environments
- Easy setup and teardown for development
- Proper data persistence and backup strategies
- Integration with DrizzleORM's latest seeding capabilities
- Accessible connection URLs for development

## 1. Project Structure

```
/Users/intern/programming/work-test/swe-lead-test/
├── docker-compose.yml
├── .env.example
├── .env (gitignored)
├── Dockerfile (if needed for app)
├── src/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── seed.ts
│   └── lib/
│       └── db.ts
├── drizzle/
│   └── (migration files)
├── scripts/
│   ├── db-reset.sh
│   ├── db-backup.sh
│   └── db-restore.sh
└── drizzle.config.ts
```

## 2. Docker Compose Configuration

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: swe_lead_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-devuser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devsecret}
      POSTGRES_DB: ${POSTGRES_DB:-swe_lead_dev}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db:/docker-entrypoint-initdb.d
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-devuser} -d ${POSTGRES_DB:-swe_lead_dev}"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 30s
    networks:
      - app_network

  # Optional: PgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: swe_lead_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@example.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
    ports:
      - "${PGADMIN_PORT:-5050}:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - app_network
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local

networks:
  app_network:
    driver: bridge
```

### Environment Configuration

**.env.example** (committed to repo)
```env
# Database Configuration
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devsecret
POSTGRES_DB=swe_lead_dev
POSTGRES_PORT=5432
DATABASE_URL=postgresql://devuser:devsecret@localhost:5432/swe_lead_dev

# PgAdmin Configuration (optional)
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050

# Node Environment
NODE_ENV=development
```

**.env** (gitignored, copy from .env.example)
```env
# Copy from .env.example and customize as needed
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devsecret
POSTGRES_DB=swe_lead_dev
POSTGRES_PORT=5432
DATABASE_URL=postgresql://devuser:devsecret@localhost:5432/swe_lead_dev
```

## 3. DrizzleORM Setup

### Package Installation
```bash
npm install drizzle-orm pg dotenv
npm install -D drizzle-kit drizzle-seed @types/pg tsx
```

### Database Schema (src/db/schema.ts)
```typescript
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### Database Connection (src/db/index.ts)
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

### Drizzle Configuration (drizzle.config.ts)
```typescript
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

## 4. Advanced Seeding Strategy

### Seed Script (src/db/seed.ts)
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { seed } from 'drizzle-seed';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';

config({ path: '.env' });

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    // Reset database (optional - use with caution)
    await seed(db).reset();
    
    // Seed with deterministic data using seed number for consistency
    await seed(db, { 
      users: schema.users,
      posts: schema.posts 
    }, { 
      seed: 1234 // Use same seed for consistent data across environments
    }).refine(() => ({
      users: {
        count: 10,
        with: {
          posts: 3, // Each user gets 3 posts
        },
      },
    }));
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
```

### Custom Seed with Realistic Data (Alternative)
```typescript
// src/db/seed-custom.ts
import { db } from './index';
import { users, posts } from './schema';
import { faker } from '@faker-js/faker';

// Set seed for consistent fake data generation
faker.seed(1234);

async function customSeed() {
  console.log('🌱 Starting custom seed...');
  
  // Clear existing data
  await db.delete(posts);
  await db.delete(users);
  
  // Create users with realistic data
  const insertedUsers = await db.insert(users).values([
    {
      name: 'John Doe',
      email: 'john@example.com',
    },
    {
      name: 'Jane Smith', 
      email: 'jane@example.com',
    },
    ...Array.from({ length: 8 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }))
  ]).returning();
  
  // Create posts for each user
  const postsData = insertedUsers.flatMap(user => 
    Array.from({ length: 3 }, () => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      published: faker.datatype.boolean(),
      authorId: user.id,
    }))
  );
  
  await db.insert(posts).values(postsData);
  
  console.log(`✅ Created ${insertedUsers.length} users and ${postsData.length} posts`);
}

if (require.main === module) {
  customSeed().catch(console.error);
}
```

## 5. Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    
    "db:up": "docker-compose up -d db",
    "db:down": "docker-compose down",
    "db:logs": "docker-compose logs db",
    "db:reset": "docker-compose down -v && docker-compose up -d db",
    
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "node --import tsx --env-file .env ./src/db/seed.ts",
    "db:seed-custom": "node --import tsx --env-file .env ./src/db/seed-custom.ts",
    
    "db:setup": "npm run db:up && sleep 5 && npm run db:push && npm run db:seed",
    "db:backup": "./scripts/db-backup.sh",
    "db:restore": "./scripts/db-restore.sh"
  }
}
```

## 6. Utility Scripts

### Database Backup Script (scripts/db-backup.sh)
```bash
#!/bin/bash
set -e

# Load environment variables
export $(grep -v '^#' .env | xargs)

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/postgres_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_FILE"
docker exec swe_lead_postgres pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
echo "Compressing backup..."
gzip $BACKUP_FILE
echo "Compressed backup: ${BACKUP_FILE}.gz"
```

### Database Restore Script (scripts/db-restore.sh)
```bash
#!/bin/bash
set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 backups/postgres_backup_20241201_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found"
    exit 1
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Decompressing backup file..."
    gunzip -c $BACKUP_FILE > temp_restore.sql
    RESTORE_FILE="temp_restore.sql"
else
    RESTORE_FILE=$BACKUP_FILE
fi

echo "Restoring database from: $RESTORE_FILE"
cat $RESTORE_FILE | docker exec -i swe_lead_postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Clean up temporary file
if [ "$RESTORE_FILE" = "temp_restore.sql" ]; then
    rm temp_restore.sql
fi

echo "Database restore completed"
```

### Make scripts executable
```bash
chmod +x scripts/db-backup.sh scripts/db-restore.sh
```

## 7. Development Workflow

### Initial Setup
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start database
npm run db:up

# 3. Wait for database to be ready and setup schema + seed data
npm run db:setup

# 4. Open Drizzle Studio to view data (optional)
npm run db:studio
```

### Daily Development
```bash
# Start database
npm run db:up

# View logs
npm run db:logs

# Reset and reseed database
npm run db:reset && npm run db:setup
```

### Data Management
```bash
# Create backup
npm run db:backup

# Restore from backup
./scripts/db-restore.sh backups/postgres_backup_20241201_120000.sql.gz

# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 8. Connection URL Management

The connection URL is managed through environment variables and is easily accessible:

1. **Local Development**: `postgresql://devuser:devsecret@localhost:5432/swe_lead_dev`
2. **Docker Network**: `postgresql://devuser:devsecret@db:5432/swe_lead_dev`
3. **Environment Variable**: `process.env.DATABASE_URL`

### Usage in Application Code (src/lib/db.ts)
```typescript
import { db } from '@/db';
import { users } from '@/db/schema';

export async function getUsers() {
  return await db.select().from(users);
}

export async function createUser(name: string, email: string) {
  return await db.insert(users).values({ name, email }).returning();
}
```

## 9. Key Benefits of This Setup

1. **Consistency**: Using deterministic seeding ensures identical data across all environments
2. **Reproducibility**: Docker containers with pinned versions ensure consistent behavior
3. **Developer Experience**: Simple commands for common operations
4. **Data Safety**: Automatic backups and easy restore procedures
5. **Scalability**: Easy to extend with additional services (Redis, etc.)
6. **Production-Ready**: Configuration follows 2024-2025 best practices

## 10. Additional Considerations

### Security
- Use Docker secrets for production deployments
- Never commit `.env` files with real credentials
- Use strong passwords for production environments

### Performance
- Consider connection pooling for production
- Use read replicas for heavy read workloads
- Monitor container resource usage

### Monitoring
- Add health checks for application containers
- Consider adding logging aggregation
- Use monitoring tools like Prometheus/Grafana for production

## Quick Start Guide

To get started immediately:

1. **Install dependencies**:
   ```bash
   npm install drizzle-orm pg dotenv
   npm install -D drizzle-kit drizzle-seed @types/pg tsx
   ```

2. **Create docker-compose.yml** with the configuration above

3. **Create .env.example** and copy to `.env`

4. **Set up your database schema** in `src/db/schema.ts`

5. **Run the setup**:
   ```bash
   docker-compose up -d
   npm run db:push
   npm run db:seed
   ```

Your PostgreSQL database will be running at `localhost:5432` with the connection URL:
```
postgresql://devuser:devsecret@localhost:5432/swe_lead_dev
```

This setup ensures consistent, reproducible data across all team members and environments.