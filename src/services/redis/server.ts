/**
 * Redis Service - Server Only
 *
 * This file ensures Redis service is only used on the server side.
 * Import from this file in API routes and Server Actions.
 *
 * ❌ DO NOT import this in client components
 * ✅ Use only in API routes, Server Actions, and Server Components
 */

import "server-only";

export { RedisService, getRedisService } from "./RedisService";
export { RedisConnectionPool } from "./RedisConnectionPool";
export { loadRedisConfig, validateRedisConfig } from "./config";
export type {
  RedisConfig,
  PoolStats,
  CacheOptions,
  SetOptions,
  ScanResult,
  BatchResult,
} from "./types";
