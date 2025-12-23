/**
 * Redis Service
 * Main service class providing Redis operations with connection pooling
 * Implements singleton pattern to ensure single instance across the application
 */

import type Redis from "ioredis";

import { loadRedisConfig, validateRedisConfig } from "./config";
import { RedisConnectionPool } from "./RedisConnectionPool";
import type { RedisConfig, SetOptions, ScanResult, PoolStats, BatchResult } from "./types";

/**
 * Redis Service - Singleton
 * Provides high-level Redis operations with connection pooling
 */
export class RedisService {
  private static instance: RedisService | null = null;
  private pool: RedisConnectionPool | null = null;
  private config: RedisConfig;
  private isInitialized = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config?: RedisConfig) {
    this.config = config || loadRedisConfig();
    validateRedisConfig(this.config);
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: RedisConfig): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService(config);
    }
    return RedisService.instance;
  }

  /**
   * Initialize the Redis service and connection pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[RedisService] Already initialized");
      return;
    }

    console.log("[RedisService] Initializing...");
    this.pool = new RedisConnectionPool(this.config);
    await this.pool.initialize();
    this.isInitialized = true;
    console.log("[RedisService] Initialized successfully");
  }

  /**
   * Ensure service is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Execute a Redis command with a pooled connection
   */
  private async executeCommand<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
    await this.ensureInitialized();
    if (!this.pool) {
      throw new Error("Redis pool not initialized");
    }
    return this.pool.execute(fn);
  }

  /**
   * Build cache key with optional namespace
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  // ==================== Basic Operations ====================

  /**
   * Set a key-value pair
   */
  async set(key: string, value: string, options?: SetOptions): Promise<"OK" | null> {
    const fullKey = this.buildKey(key, options?.namespace);

    return this.executeCommand(async (client) => {
      // Build options for ioredis set command
      if (options?.ttl && !options?.nx && !options?.xx && !options?.get) {
        // Simple case with just TTL
        return client.set(fullKey, value, "EX", options.ttl);
      }

      if (options?.nx && options?.ttl) {
        return client.set(fullKey, value, "EX", options.ttl, "NX");
      }

      if (options?.xx && options?.ttl) {
        return client.set(fullKey, value, "EX", options.ttl, "XX");
      }

      if (options?.nx) {
        return client.set(fullKey, value, "NX");
      }

      if (options?.xx) {
        return client.set(fullKey, value, "XX");
      }

      // Default case - simple set
      return client.set(fullKey, value);
    });
  }

  /**
   * Set a JSON value
   */
  async setJSON<T = unknown>(key: string, value: T, options?: SetOptions): Promise<"OK" | null> {
    const serialized = JSON.stringify(value);
    return this.set(key, serialized, options);
  }

  /**
   * Get a value by key
   */
  async get(key: string, namespace?: string): Promise<string | null> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.get(fullKey));
  }

  /**
   * Get a JSON value
   */
  async getJSON<T = unknown>(key: string, namespace?: string): Promise<T | null> {
    const value = await this.get(key, namespace);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[RedisService] Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete one or more keys
   */
  async del(keys: string | string[], namespace?: string): Promise<number> {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const fullKeys = keyArray.map((key) => this.buildKey(key, namespace));

    return this.executeCommand((client) => client.del(...fullKeys));
  }

  /**
   * Check if key exists
   */
  async exists(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    const result = await this.executeCommand((client) => client.exists(fullKey));
    return result === 1;
  }

  /**
   * Set expiration time for a key (in seconds)
   */
  async expire(key: string, seconds: number, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    const result = await this.executeCommand((client) => client.expire(fullKey, seconds));
    return result === 1;
  }

  /**
   * Get time to live for a key (in seconds)
   */
  async ttl(key: string, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.ttl(fullKey));
  }

  // ==================== Hash Operations ====================

  /**
   * Set hash field
   */
  async hset(key: string, field: string, value: string, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.hset(fullKey, field, value));
  }

  /**
   * Set multiple hash fields
   */
  async hmset(key: string, data: Record<string, string>, namespace?: string): Promise<"OK"> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.hmset(fullKey, data));
  }

  /**
   * Get hash field
   */
  async hget(key: string, field: string, namespace?: string): Promise<string | null> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.hget(fullKey, field));
  }

  /**
   * Get all hash fields
   */
  async hgetall(key: string, namespace?: string): Promise<Record<string, string>> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.hgetall(fullKey));
  }

  /**
   * Delete hash field
   */
  async hdel(key: string, field: string | string[], namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    const fields = Array.isArray(field) ? field : [field];
    return this.executeCommand((client) => client.hdel(fullKey, ...fields));
  }

  // ==================== List Operations ====================

  /**
   * Push to list (right)
   */
  async rpush(key: string, value: string | string[], namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    const values = Array.isArray(value) ? value : [value];
    return this.executeCommand((client) => client.rpush(fullKey, ...values));
  }

  /**
   * Push to list (left)
   */
  async lpush(key: string, value: string | string[], namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    const values = Array.isArray(value) ? value : [value];
    return this.executeCommand((client) => client.lpush(fullKey, ...values));
  }

  /**
   * Pop from list (right)
   */
  async rpop(key: string, namespace?: string): Promise<string | null> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.rpop(fullKey));
  }

  /**
   * Pop from list (left)
   */
  async lpop(key: string, namespace?: string): Promise<string | null> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.lpop(fullKey));
  }

  /**
   * Get list range
   */
  async lrange(key: string, start: number, stop: number, namespace?: string): Promise<string[]> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.lrange(fullKey, start, stop));
  }

  /**
   * Get list length
   */
  async llen(key: string, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.llen(fullKey));
  }

  // ==================== Set Operations ====================

  /**
   * Add members to set
   */
  async sadd(key: string, member: string | string[], namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    const members = Array.isArray(member) ? member : [member];
    return this.executeCommand((client) => client.sadd(fullKey, ...members));
  }

  /**
   * Get all set members
   */
  async smembers(key: string, namespace?: string): Promise<string[]> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.smembers(fullKey));
  }

  /**
   * Check if member exists in set
   */
  async sismember(key: string, member: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    const result = await this.executeCommand((client) => client.sismember(fullKey, member));
    return result === 1;
  }

  /**
   * Remove members from set
   */
  async srem(key: string, member: string | string[], namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    const members = Array.isArray(member) ? member : [member];
    return this.executeCommand((client) => client.srem(fullKey, ...members));
  }

  // ==================== Sorted Set Operations ====================

  /**
   * Add member to sorted set
   */
  async zadd(
    key: string,
    score: number,
    member: string,
    namespace?: string
  ): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.zadd(fullKey, score, member));
  }

  /**
   * Get sorted set range by score
   */
  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    namespace?: string
  ): Promise<string[]> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.zrangebyscore(fullKey, min, max));
  }

  /**
   * Get sorted set range with scores
   */
  async zrange(
    key: string,
    start: number,
    stop: number,
    namespace?: string
  ): Promise<string[]> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.zrange(fullKey, start, stop));
  }

  // ==================== Advanced Operations ====================

  /**
   * Increment a counter
   */
  async incr(key: string, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.incr(fullKey));
  }

  /**
   * Increment by amount
   */
  async incrby(key: string, amount: number, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.incrby(fullKey, amount));
  }

  /**
   * Decrement a counter
   */
  async decr(key: string, namespace?: string): Promise<number> {
    const fullKey = this.buildKey(key, namespace);
    return this.executeCommand((client) => client.decr(fullKey));
  }

  /**
   * Scan keys with pattern
   */
  async scan(cursor: string, pattern: string, count = 100): Promise<ScanResult> {
    const result = await this.executeCommand((client) =>
      client.scan(cursor, "MATCH", pattern, "COUNT", count)
    );

    // ioredis scan returns [cursor: string, keys: string[]]
    const [newCursor, keys] = result as [string, string[]];

    return {
      cursor: newCursor,
      keys,
    };
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string, namespace?: string): Promise<string[]> {
    const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;
    return this.executeCommand((client) => client.keys(fullPattern));
  }

  /**
   * Delete all keys matching pattern (use with caution)
   */
  async deletePattern(pattern: string, namespace?: string): Promise<number> {
    const fullPattern = namespace ? `${namespace}:${pattern}` : pattern;
    const keys = await this.keys(fullPattern);

    if (keys.length === 0) {
      return 0;
    }

    return this.executeCommand((client) => client.del(...keys));
  }

  /**
   * Execute a pipeline of commands
   */
  async pipeline<T = unknown>(
    commands: Array<(client: Redis) => void>
  ): Promise<Array<BatchResult<T>>> {
    return this.executeCommand(async (client) => {
      const pipeline = client.pipeline();

      commands.forEach((cmd) => cmd(pipeline as unknown as Redis));

      const results = await pipeline.exec();

      if (!results) {
        return [];
      }

      return results.map(([error, data]: [Error | null, unknown]) => ({
        success: !error,
        data: data as T,
        error: error || undefined,
      }));
    });
  }

  // ==================== Cache Helpers ====================

  /**
   * Get or set cache with function
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
    namespace?: string
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.getJSON<T>(key, namespace);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.setJSON(key, result, { ttl, namespace });
    return result;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateCache(pattern: string, namespace?: string): Promise<number> {
    return this.deletePattern(pattern, namespace);
  }

  // ==================== Service Management ====================

  /**
   * Get pool statistics
   */
  getPoolStats(): PoolStats | null {
    return this.pool?.getStats() || null;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }
    return this.pool.healthCheck();
  }

  /**
   * Flush all data in current database (use with extreme caution)
   */
  async flushdb(): Promise<"OK"> {
    return this.executeCommand((client) => client.flushdb());
  }

  /**
   * Shutdown the Redis service
   */
  async shutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.drain();
      this.pool = null;
    }
    this.isInitialized = false;
    RedisService.instance = null;
    console.log("[RedisService] Shutdown complete");
  }
}

/**
 * Get the singleton Redis service instance
 */
export function getRedisService(config?: RedisConfig): RedisService {
  return RedisService.getInstance(config);
}
