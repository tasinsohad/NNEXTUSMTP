// Cloudflare D1 type declarations
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: unknown;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface CloudflareEnv {
  DB: D1Database;
  [key: string]: unknown;
}

declare namespace NodeJS {
  interface ProcessEnv extends CloudflareEnv {}
}

// Types for @cloudflare/next-on-pages
declare module '@cloudflare/next-on-pages' {
  export function getRequestContext<T = CloudflareEnv>(): {
    env: T;
    ctx: ExecutionContext;
    cf: IncomingRequestCfProperties;
  };
}

// Type declaration for drizzle-kit config
declare module 'drizzle-kit' {
  interface Config {
    schema?: string;
    out?: string;
    driver?: string;
    dbCredentials?: Record<string, string>;
  }
}
