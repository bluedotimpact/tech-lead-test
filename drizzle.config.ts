import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  console.error("Please add DATABASE_URL env with your postgres connection string");
  process.exit(1);
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: "timestamp",
  },
} satisfies Config;
