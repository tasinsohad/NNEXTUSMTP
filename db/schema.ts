import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users (D1-based auth)
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Auth sessions (cookie-based)
export const authSessions = sqliteTable('auth_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Subdomain prefix bank
export const subdomainPrefixes = sqliteTable('subdomain_prefixes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  prefix: text('prefix').unique().notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Name bank
export const nameBank = sqliteTable('name_bank', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text('first_name').notNull(),
  fullName: text('full_name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// VPS server configurations
export const vpsConfigs = sqliteTable('vps_configs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  label: text('label').notNull(),
  ip: text('ip').notNull(),
  apiBaseUrl: text('api_base_url').notNull(),
  serverType: text('server_type').notNull(), // mailcow, mailu, iredmail, custom
  apiKey: text('api_key'),
  customTemplate: text('custom_template'), // SQLite stores JSON as text
  quotaMb: integer('quota_mb').default(1024),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Cloudflare account configurations
export const cloudflareAccounts = sqliteTable('cloudflare_accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  label: text('label').notNull(),
  email: text('email'),
  apiKey: text('api_key'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  stage: integer('stage').default(1),
  payload: text('payload').notNull().default('{}'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Plans
export const plans = sqliteTable('plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  summary: text('summary'),
});

// Plan Domains
export const planDomains = sqliteTable('plan_domains', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text('plan_id').references(() => plans.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  ip: text('ip').notNull(),
  vpsProvider: text('vps_provider'),
  vpsConfigId: text('vps_config_id').references(() => vpsConfigs.id),
  cfAccountId: text('cf_account_id').references(() => cloudflareAccounts.id),
  cfZoneId: text('cf_zone_id'),
  dkimKey: text('dkim_key'),
  totalInboxes: integer('total_inboxes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Plan Subdomains
export const planSubdomains = sqliteTable('plan_subdomains', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  domainId: text('domain_id').references(() => planDomains.id, { onDelete: 'cascade' }),
  subdomain: text('subdomain').notNull(),
  fullSubdomain: text('full_subdomain').notNull(),
  inboxCount: integer('inbox_count').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Mailboxes
export const mailboxes = sqliteTable('mailboxes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  subdomainId: text('subdomain_id').references(() => planSubdomains.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  firstName: text('first_name'),
  fullName: text('full_name'),
  password: text('password'),
  status: text('status').default('pending'), // pending, created, failed
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Jobs
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text('plan_id').references(() => plans.id, { onDelete: 'cascade' }),
  jobType: text('job_type').notNull(), // dns_push, mailbox_create, dkim_fetch, dkim_inject
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  status: text('status').default('pending'), // pending, processing, done, failed
  attempts: integer('attempts').default(0),
  errorMessage: text('error_message'),
  result: text('result'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// DNS Records
export const dnsRecords = sqliteTable('dns_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  domainId: text('domain_id').references(() => planDomains.id, { onDelete: 'cascade' }),
  subdomainId: text('subdomain_id').references(() => planSubdomains.id),
  recordName: text('record_name').notNull(),
  recordType: text('record_type').notNull(),
  recordContent: text('record_content').notNull(),
  cfRecordId: text('cf_record_id'),
  status: text('status').default('pending'), // pending, created, skipped, failed
  isDkim: integer('is_dkim', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
