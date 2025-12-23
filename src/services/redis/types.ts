/**
 * Redis service types and interfaces
 */

/**
 * Redis configuration options
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetries?: number;
  retryDelay?: number;
  connectTimeout?: number;
  commandTimeout?: number;
  keepAlive?: number;
  poolMin?: number;
  poolMax?: number;
}

/**
 * Redis connection pool statistics
 */
export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
}

/**
 * Redis cache options
 */
export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Namespace prefix for the key */
  namespace?: string;
}

/**
 * Redis set options
 */
export interface SetOptions extends CacheOptions {
  /** Set only if key doesn't exist (NX) */
  nx?: boolean;
  /** Set only if key exists (XX) */
  xx?: boolean;
  /** Get the old value when setting new value */
  get?: boolean;
}

/**
 * Redis scan result
 */
export interface ScanResult {
  cursor: string;
  keys: string[];
}

/**
 * Redis batch operation result
 */
export interface BatchResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}
