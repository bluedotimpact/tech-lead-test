import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

export async function resetDatabaseSchema(): Promise<void> {
  console.log("[INFO] Starting fresh database setup...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log("[INFO] Resetting database schema...");

    // Clean slate approach - drop entire schema and recreate
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);

    // Clear migration tracking to ensure migrations run again
    console.log("[INFO] Clearing migration tracking...");
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);

    // Apply all migrations to recreate the schema
    console.log("[INFO] Running database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[SUCCESS] All migrations applied successfully");

    console.log("[SUCCESS] Fresh database setup completed");
  } catch (error) {
    console.error("[ERROR] Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabaseSchema();
}
