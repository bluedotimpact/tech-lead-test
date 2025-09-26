import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const { Pool } = pg;

export async function resetDatabaseSchema(): Promise<void> {
  console.log("[INFO] Starting fresh database setup...");
  await dropAllTables();
  await runMigrations();
  console.log("[SUCCESS] Fresh database setup completed");
}

async function dropAllTables(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("[INFO] Dropping all tables and types...");

    // Drop all tables (CASCADE will handle foreign key dependencies)
    await db.execute(sql`DROP TABLE IF EXISTS exercises CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS resources CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS chunks CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS units CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS courses CASCADE`);

    // Drop all custom types
    await db.execute(sql`DROP TYPE IF EXISTS course_status CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS resource_type CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS resource_status CASCADE`);

    // Drop migration table to start fresh
    await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`);

    console.log("[SUCCESS] All tables and types dropped successfully");
  } catch (error) {
    console.error("[ERROR] Error resetting database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function runMigrations(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log("[INFO] Running database migrations...");
    
    // Get all migration files and sort them by timestamp
    const migrationsDir = path.resolve("./drizzle");
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log("[INFO] No migration files found");
      return;
    }
    
    console.log(`[INFO] Found ${migrationFiles.length} migration file(s)`);
    
    for (const migrationFile of migrationFiles) {
      console.log(`[INFO] Applying migration: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split by statement breakpoint and execute each statement
      const statements = migrationSQL
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        if (statement.length > 0) {
          await db.execute(sql.raw(statement));
        }
      }
      
      console.log(`[SUCCESS] Applied migration: ${migrationFile}`);
    }
    
    console.log("[SUCCESS] All migrations applied successfully");
  } catch (error) {
    console.error("[ERROR] Error running migrations:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabaseSchema();
}
