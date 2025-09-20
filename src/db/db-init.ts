import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Pool } = pg;

export async function resetDatabaseSchema(): Promise<void> {
  console.log("[INFO] Starting fresh database setup...");
  await dropAllTables();
  await createDatabaseSchema();
  console.log("[SUCCESS] Fresh database setup completed");
}

async function dropAllTables(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("[INFO] Dropping all tables...");

    // Drop all tables in the correct order (reverse of creation order)
    await db.execute(sql`DROP TABLE IF EXISTS exercises CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS resources CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS chunks CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS units CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS courses CASCADE`);

    console.log("[SUCCESS] All tables dropped successfully");
  } catch (error) {
    console.error("[ERROR] Error resetting database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createDatabaseSchema(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("[INFO] Creating database tables...");

    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE course_status AS ENUM ('Active');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE resource_type AS ENUM ('Article', 'Blog', 'Paper', 'Website');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE resource_status AS ENUM ('Core', 'Maybe', 'Supplementary', 'Optional');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "status" "course_status" DEFAULT 'Active' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "courses_slug_unique" UNIQUE("slug")
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "units" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "course_id" uuid NOT NULL,
        "title" text NOT NULL,
        "order" integer NOT NULL,
        "duration" integer,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "units_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "chunks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "unit_id" uuid NOT NULL,
        "title" text NOT NULL,
        "content" text,
        "order" integer NOT NULL,
        "time_minutes" integer,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "chunks_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "resources" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "chunk_id" uuid NOT NULL,
        "title" text NOT NULL,
        "url" text NOT NULL,
        "author" text,
        "year" integer,
        "type" "resource_type" NOT NULL,
        "time_minutes" integer,
        "description" text,
        "order" integer NOT NULL,
        "status" "resource_status" DEFAULT 'Core' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "resources_chunk_id_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."chunks"("id") ON DELETE cascade ON UPDATE no action
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "exercises" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "chunk_id" uuid NOT NULL,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "type" text NOT NULL,
        "time_minutes" integer,
        "order" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "exercises_chunk_id_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."chunks"("id") ON DELETE cascade ON UPDATE no action
      )
    `);

    console.log("[SUCCESS] All tables created successfully");
  } catch (error) {
    console.error("[ERROR] Error creating tables:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabaseSchema();
}
