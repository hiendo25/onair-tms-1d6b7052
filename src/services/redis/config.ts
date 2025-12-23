/**
 * Redis configuration loader
 * Loads configuration from environment variables
 */

import type { RedisConfig } from "./types";

/**
 * Load Redis configuration from environment variables
 */
export function loadRedisConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || "0", 10),
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || "3", 10),
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || "1000", 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || "10000", 10),
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || "5000", 10),
    keepAlive: parseInt(process.env.REDIS_KEEPALIVE || "30000", 10),
    poolMin: parseInt(process.env.REDIS_POOL_MIN || "2", 10),
    poolMax: parseInt(process.env.REDIS_POOL_MAX || "10", 10),
  };
}

/**
 * Validate Redis configuration
 */
export function validateRedisConfig(config: RedisConfig): void {
  if (!config.host) {
    throw new Error("Redis host is required");
  }

  if (config.port <= 0 || config.port > 65535) {
    throw new Error("Redis port must be between 1 and 65535");
  }

  if (config.db !== undefined && (config.db < 0 || config.db > 15)) {
    throw new Error("Redis DB must be between 0 and 15");
  }

  if (config.poolMin && config.poolMax && config.poolMin > config.poolMax) {
    throw new Error("Pool min cannot be greater than pool max");
  }
}
