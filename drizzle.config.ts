export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'd1-http',
  dbCredentials: {
    accountId: String(process.env.CLOUDFLARE_ACCOUNT_ID || ''),
    databaseId: String(process.env.CLOUDFLARE_DATABASE_ID || ''),
    token: String(process.env.CLOUDFLARE_D1_TOKEN || ''),
  },
};
