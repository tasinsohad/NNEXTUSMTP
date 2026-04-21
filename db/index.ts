import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema });
}

// For local development with wrangler dev
// The 'env' object is injected into the context in Cloudflare Pages
