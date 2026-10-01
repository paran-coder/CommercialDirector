import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

export type AppDatabase = NodePgDatabase<typeof schema>;

let pool: Pool | null = null;
let database: AppDatabase | null = null;

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabase(): AppDatabase | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  if (!database) database = drizzle(pool, { schema });
  return database;
}
