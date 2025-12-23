/**
 * Redis Service Module
 *
 * ⚠️ IMPORTANT: Redis is SERVER-ONLY
 *
 * For server-side usage (API routes, Server Actions):
 *   import { getRedisService } from "@/services/redis/server"
 *
 * This index file exports types only to prevent client-side bundling issues.
 */

// Export types only - safe for client and server
export type {
  RedisConfig,
  PoolStats,
  CacheOptions,
  SetOptions,
  ScanResult,
  BatchResult,
} from "./types";

// Do NOT export the actual service classes here
// They should be imported from "./server" to ensure server-only usage
