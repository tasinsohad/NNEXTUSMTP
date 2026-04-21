import { users, authSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import type { CloudflareEnv } from '@/env';

const SESSION_COOKIE_NAME = 'nxt_session';
const SESSION_DURATION_DAYS = 30;

/**
 * Hash a password using Web Crypto API (PBKDF2) — works on Cloudflare Edge
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, originalHashHex] = storedHash.split(':');
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === originalHashHex;
}

/**
 * Generate a secure random session token
 */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate session expiry date
 */
export function getExpiryDate(): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);
  return expires.toISOString();
}

/**
 * Get session cookie name
 */
export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

/**
 * Get session duration in days
 */
export function getSessionDurationDays(): number {
  return SESSION_DURATION_DAYS;
}

/**
 * Verify a session token against D1 and return the user ID
 * Used in middleware and server-side layout
 */
export async function verifySession(env: CloudflareEnv, token: string): Promise<{ userId: string; email: string } | null> {
  if (!token) return null;

  const db = getDb(env);
  const [session] = await db.select()
    .from(authSessions)
    .where(eq(authSessions.token, token))
    .limit(1);

  if (!session) return null;

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    // Clean up expired session
    await db.delete(authSessions).where(eq(authSessions.id, session.id));
    return null;
  }

  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) return null;

  return { userId: user.id, email: user.email };
}

/**
 * Create a new session for a user and return the token
 */
export async function createSession(env: CloudflareEnv, userId: string): Promise<string> {
  const db = getDb(env);
  const token = generateToken();
  const expiresAt = getExpiryDate();

  await db.insert(authSessions).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Delete a session by token
 */
export async function deleteSession(env: CloudflareEnv, token: string): Promise<void> {
  const db = getDb(env);
  await db.delete(authSessions).where(eq(authSessions.token, token));
}

/**
 * Register a new user — returns user id or throws
 */
export async function registerUser(env: CloudflareEnv, email: string, password: string): Promise<string> {
  const db = getDb(env);
  const passwordHash = await hashPassword(password);

  const [user] = await db.insert(users).values({
    email,
    passwordHash,
  }).returning();

  return user.id;
}

/**
 * Authenticate a user — returns user id or null
 */
export async function authenticateUser(env: CloudflareEnv, email: string, password: string): Promise<string | null> {
  const db = getDb(env);

  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return user.id;
}
