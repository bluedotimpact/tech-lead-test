import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check and log connection status
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  console.error("Please create .env.local file with:");
  console.error("DATABASE_URL=postgresql://postgres:password@localhost:5432/swe_lead_dev");
  throw new Error("DATABASE_URL is required");
}

console.log("Connecting to PostgreSQL database...");

// Create connection pool for local PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Local development settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
    console.error("Make sure PostgreSQL is running locally and DATABASE_URL is correct");
  } else {
    console.log("Successfully connected to PostgreSQL");
    release();
  }
});

// Create drizzle instance
export const db = drizzle(pool, { schema });
export type Database = typeof db;
