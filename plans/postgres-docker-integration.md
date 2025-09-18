# PostgreSQL Docker Integration Plan

## Project Analysis

The existing Next.js project has a solid foundation with:
- **Database ORM**: Drizzle ORM with PostgreSQL driver configured
- **API Layer**: tRPC with routers for data access
- **Schema**: Comprehensive database schema with 6 tables (courses, units, exercises, resources, chunks, chunk_resources)
- **Environment**: Environment variable management with `.env.local`
- **Connection**: PostgreSQL connection pooling via `pg` package

## 1. Docker Setup (docker-compose configuration)

### Create `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: swe-lead-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: swe_lead_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d swe_lead_app"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: swe-lead-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  postgres_data:
  pgadmin_data:
```

### Create `docker-compose.dev.yml` (Development Override)
```yaml
version: '3.8'

services:
  postgres:
    environment:
      POSTGRES_DB: swe_lead_app_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    volumes:
      - ./docker/postgres/dev-data:/docker-entrypoint-initdb.d/dev-data:ro
```

## 2. PostgreSQL Configuration with Sensible Defaults

### Create `docker/postgres/init.sql`
```sql
-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create read-only user for analytics (if needed)
CREATE USER readonly_user WITH PASSWORD 'readonly_pass';
GRANT CONNECT ON DATABASE swe_lead_app TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- Performance settings for development
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
```

### Create `docker/postgres/dev-data/sample-data.sql`
```sql
-- Sample development data
INSERT INTO courses (record_id, course, status, course_slug, short_course_description, created_at, updated_at) VALUES
('course-001', 'Introduction to Programming', 'active', 'intro-programming', 'Learn the basics of programming', NOW(), NOW()),
('course-002', 'Advanced Web Development', 'draft', 'advanced-web-dev', 'Master modern web technologies', NOW(), NOW());

INSERT INTO units (record_id, course_unit, topic, description, "order", course, course_status, unit_status, unit_number, course_record_id, course_slug, created_at, updated_at) VALUES
('unit-001', 'Variables and Data Types', 'Programming Fundamentals', 'Understanding variables and basic data types', 1, 'Introduction to Programming', 'active', 'published', 1, 'course-001', 'intro-programming', NOW(), NOW()),
('unit-002', 'Control Flow', 'Programming Logic', 'Loops, conditionals, and program flow', 2, 'Introduction to Programming', 'active', 'published', 2, 'course-001', 'intro-programming', NOW(), NOW());
```

## 3. Database Connection Setup for Next.js App

### Update `.env.local.example`
```env
# PostgreSQL connection string for Docker container
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swe_lead_app

# Alternative for development environment
# DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/swe_lead_app_dev

# Database connection pool settings
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# Optional: Enable query logging in development
DB_ENABLE_LOGGING=true
```

### Enhanced Database Connection (`src/db/index.ts`)
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  console.error('Please create .env.local file with:');
  console.error('DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swe_lead_app');
  throw new Error('DATABASE_URL is required');
}

const isDevelopment = process.env.NODE_ENV === 'development';
const enableLogging = process.env.DB_ENABLE_LOGGING === 'true';

console.log(`📦 Connecting to PostgreSQL database (${isDevelopment ? 'development' : 'production'})...`);

// Create connection pool with configurable settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
});

// Connection health check
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Successfully connected to PostgreSQL');
    return true;
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
    console.error('Make sure Docker container is running: docker-compose up postgres');
    return false;
  }
}

// Test connection on startup (non-blocking)
testConnection();

// Create drizzle instance with optional logging
export const db = drizzle(pool, { 
  schema,
  logger: enableLogging ? console.log : false
});

export type Database = typeof db;

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  await pool.end();
  process.exit(0);
});
```

## 4. Environment Variable Management

### Create `.env.development`
```env
# Development environment variables
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/swe_lead_app
DB_ENABLE_LOGGING=true
```

### Create `.env.production`
```env
# Production environment variables
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
DB_ENABLE_LOGGING=false
```

### Update `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DB_ENABLE_LOGGING: process.env.DB_ENABLE_LOGGING,
  },
  // Ensure environment variables are available at build time
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

export default nextConfig;
```

## 5. Development Workflow

### Create `scripts/db-setup.sh`
```bash
#!/bin/bash

# Database setup script for development

echo "🐳 Starting PostgreSQL Docker container..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U postgres; do sleep 2; done'

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is ready!"
    
    echo "📊 Running database migrations..."
    npm run db:push
    
    echo "🌱 Database setup complete!"
    echo "🔗 Connection string: postgresql://postgres:postgres@localhost:5432/swe_lead_app"
    echo "🎛️  pgAdmin available at: http://localhost:8080 (admin@example.com / admin)"
else
    echo "❌ PostgreSQL failed to start within 60 seconds"
    exit 1
fi
```

### Create `scripts/db-reset.sh`
```bash
#!/bin/bash

# Reset database script

echo "🗑️  Stopping and removing existing containers..."
docker-compose down -v

echo "🐳 Starting fresh PostgreSQL container..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U postgres; do sleep 2; done'

echo "📊 Pushing schema to fresh database..."
npm run db:push

echo "🌱 Database reset complete!"
```

### Update `package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:setup": "chmod +x scripts/db-setup.sh && ./scripts/db-setup.sh",
    "db:reset": "chmod +x scripts/db-reset.sh && ./scripts/db-reset.sh",
    "db:start": "docker-compose up -d postgres",
    "db:stop": "docker-compose stop postgres",
    "db:logs": "docker-compose logs -f postgres",
    "pgadmin": "docker-compose up -d pgadmin && echo 'pgAdmin available at http://localhost:8080'"
  }
}
```

## 6. Sample Schema/Migrations Setup

### Create `drizzle/migrations/0001_initial_schema.sql`
```sql
-- Initial schema migration
-- Generated by drizzle-kit

CREATE TABLE IF NOT EXISTS "courses" (
    "record_id" varchar(50) PRIMARY KEY NOT NULL,
    "course" text NOT NULL,
    "status" varchar(20) NOT NULL,
    "units" text,
    "course_slug" varchar(100) NOT NULL,
    "course_url" text,
    "course_absolute_path" text,
    "short_course_description" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_courses_status" ON "courses" ("status");
CREATE INDEX IF NOT EXISTS "idx_courses_slug" ON "courses" ("course_slug");
CREATE INDEX IF NOT EXISTS "idx_courses_created_at" ON "courses" ("created_at");

-- [Additional table creation statements based on existing schema...]

-- Add constraints and relationships
ALTER TABLE "units" ADD CONSTRAINT "fk_units_course" 
    FOREIGN KEY ("course_record_id") REFERENCES "courses"("record_id") 
    ON DELETE CASCADE;
```

### Update `drizzle.config.ts` with migration settings
```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  console.error('Please add DATABASE_URL env with your postgres connection string');
  process.exit(1);
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: 'index',
    table: '__drizzle_migrations__',
    schema: 'public',
  },
} satisfies Config;
```

## 7. Integration with Existing API Routes

### Enhanced tRPC Context with Database (`src/server/context.ts`)
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../db';

export async function createContext({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  return {
    req,
    res,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

### Sample Database Service (`src/services/courseService.ts`)
```typescript
import { db } from '../db';
import { courses, units, exercises } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export class CourseService {
  static async getAllCourses() {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  static async getCourseWithUnits(courseSlug: string) {
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.courseSlug, courseSlug))
      .limit(1);

    if (!course.length) return null;

    const courseUnits = await db
      .select()
      .from(units)
      .where(eq(units.courseRecordId, course[0].recordId))
      .orderBy(units.order);

    return {
      ...course[0],
      units: courseUnits,
    };
  }

  static async createCourse(courseData: {
    recordId: string;
    course: string;
    status: string;
    courseSlug: string;
    shortCourseDescription?: string;
  }) {
    return await db.insert(courses).values(courseData).returning();
  }
}
```

### Update existing tRPC router (`src/server/routers/course.ts`)
```typescript
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { CourseService } from '../../services/courseService';

export const courseRouter = router({
  getAll: publicProcedure.query(async () => {
    return await CourseService.getAllCourses();
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await CourseService.getCourseWithUnits(input.slug);
    }),

  create: publicProcedure
    .input(z.object({
      recordId: z.string(),
      course: z.string(),
      status: z.string(),
      courseSlug: z.string(),
      shortCourseDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await CourseService.createCourse(input);
    }),

  // Health check procedure
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.db.execute('SELECT 1');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error('Database connection failed');
    }
  }),
});
```

## 8. Dependencies and Packages

### Required Dependencies (Already Present)
```json
{
  "dependencies": {
    "drizzle-orm": "^0.44.5",
    "pg": "^8.16.3",
    "dotenv": "^17.2.2"
  },
  "devDependencies": {
    "@types/pg": "^8.15.5",
    "drizzle-kit": "^0.31.4"
  }
}
```

### Optional Additional Dependencies
```bash
# For enhanced development experience
npm install --save-dev @types/node concurrently wait-port

# For database seeding and testing
npm install --save-dev @faker-js/faker cross-env
```

## 9. Testing and Quality Assurance

### Create `tests/db-connection.test.ts`
```typescript
import { db } from '../src/db';

describe('Database Connection', () => {
  test('should connect to database', async () => {
    const result = await db.execute('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  test('should have all required tables', async () => {
    const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = tables.rows.map(row => row.table_name);
    expect(tableNames).toContain('courses');
    expect(tableNames).toContain('units');
    expect(tableNames).toContain('exercises');
  });
});
```

## 10. Documentation and README Updates

### Create `docs/DATABASE.md`
```markdown
# Database Setup Guide

## Quick Start
1. `npm run db:setup` - Start PostgreSQL and run migrations
2. `npm run dev` - Start development server
3. Visit http://localhost:8080 for pgAdmin (optional)

## Commands
- `npm run db:start` - Start PostgreSQL container
- `npm run db:stop` - Stop PostgreSQL container
- `npm run db:reset` - Reset database with fresh data
- `npm run db:studio` - Open Drizzle Studio
- `npm run pgadmin` - Start pgAdmin interface

## Connection Details
- **Host**: localhost:5432
- **Database**: swe_lead_app
- **Username**: postgres
- **Password**: postgres
```

## Implementation Order

1. **Phase 1**: Docker Setup
   - Create docker-compose.yml
   - Create initialization scripts
   - Test container startup

2. **Phase 2**: Environment Configuration
   - Update environment files
   - Enhance database connection
   - Add health checks

3. **Phase 3**: Development Workflow
   - Create helper scripts
   - Update package.json scripts
   - Test development workflow

4. **Phase 4**: Integration Testing
   - Test existing tRPC routes
   - Verify database operations
   - Validate schema migrations

5. **Phase 5**: Documentation
   - Update README
   - Create database documentation
   - Document development workflow

## Success Criteria

- ✅ PostgreSQL runs in Docker container
- ✅ Next.js app connects to database successfully
- ✅ Existing tRPC routes work with database
- ✅ Database migrations run without errors
- ✅ Development workflow is streamlined
- ✅ pgAdmin provides easy database management
- ✅ All existing functionality remains intact

This plan provides a robust, production-ready PostgreSQL Docker integration while maintaining the existing project structure and functionality.