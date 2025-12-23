/**
 * Redis Connection Pool
 * Manages a pool of Redis connections for optimal resource usage
 */

import type Redis from "ioredis";

import type { RedisConfig, PoolStats } from "./types";

/**
 * Connection wrapper to track usage
 */
interface PooledConnection {
  client: Redis;
  inUse: boolean;
  createdAt: number;
  lastUsedAt: number;
}

/**
 * Redis Connection Pool implementation
 * Manages multiple Redis connections with automatic scaling
 */
export class RedisConnectionPool {
  private connections: PooledConnection[] = [];
  private config: RedisConfig;
  private minConnections: number;
  private maxConnections: number;
  private waitingQueue: Array<(client: Redis) => void> = [];
  private isShuttingDown = false;

  constructor(config: RedisConfig) {
    this.config = config;
    this.minConnections = config.poolMin || 2;
    this.maxConnections = config.poolMax || 10;
  }

  /**
   * Initialize the connection pool with minimum connections
   */
  async initialize(): Promise<void> {
    if (this.connections.length > 0) {
      return; // Already initialized
    }

    console.log(`[Redis Pool] Initializing with ${this.minConnections} connections...`);

    const initPromises: Promise<void>[] = [];
    for (let i = 0; i < this.minConnections; i++) {
      initPromises.push(this.createConnection());
    }

    await Promise.all(initPromises);
    console.log(`[Redis Pool] Initialized with ${this.connections.length} connections`);
  }

  /**
   * Create a new Redis connection
   */
  private async createConnection(): Promise<void> {
    // Dynamically import ioredis to avoid bundling in client
    const { default: IORedis } = await import("ioredis");

    const client = new IORedis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      maxRetriesPerRequest: this.config.maxRetries,
      retryStrategy: (times: number) => {
        if (times > (this.config.maxRetries || 3)) {
          console.error(`[Redis Pool] Max retries reached (${times})`);
          return null;
        }
        const delay = Math.min(times * (this.config.retryDelay || 1000), 5000);
        console.log(`[Redis Pool] Retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
      connectTimeout: this.config.connectTimeout,
      commandTimeout: this.config.commandTimeout,
      keepAlive: this.config.keepAlive,
      lazyConnect: false,
      enableOfflineQueue: true,
      enableReadyCheck: true,
    });

    // Handle connection events
    client.on("error", (error: Error) => {
      console.error("[Redis Pool] Connection error:", error);
    });

    client.on("connect", () => {
      console.log("[Redis Pool] Connection established");
    });

    client.on("ready", () => {
      console.log("[Redis Pool] Connection ready");
    });

    client.on("reconnecting", () => {
      console.log("[Redis Pool] Reconnecting...");
    });

    // Wait for connection to be ready
    await client.ping();

    const pooledConnection: PooledConnection = {
      client,
      inUse: false,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    this.connections.push(pooledConnection);
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<Redis> {
    if (this.isShuttingDown) {
      throw new Error("Connection pool is shutting down");
    }

    // Try to find an idle connection
    const idleConnection = this.connections.find((conn) => !conn.inUse);

    if (idleConnection) {
      idleConnection.inUse = true;
      idleConnection.lastUsedAt = Date.now();
      return idleConnection.client;
    }

    // If pool is not at max capacity, create a new connection
    if (this.connections.length < this.maxConnections) {
      await this.createConnection();
      const newConnection = this.connections[this.connections.length - 1];
      if (newConnection) {
        newConnection.inUse = true;
        newConnection.lastUsedAt = Date.now();
        return newConnection.client;
      }
    }

    // Wait for a connection to become available
    console.log("[Redis Pool] All connections in use, waiting...");
    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  /**
   * Release a connection back to the pool
   */
  release(client: Redis): void {
    const connection = this.connections.find((conn) => conn.client === client);

    if (!connection) {
      console.warn("[Redis Pool] Tried to release unknown connection");
      return;
    }

    connection.inUse = false;
    connection.lastUsedAt = Date.now();

    // If there are waiting requests, give them the connection
    const waiting = this.waitingQueue.shift();
    if (waiting) {
      connection.inUse = true;
      waiting(client);
    }
  }

  /**
   * Execute a function with a pooled connection
   * Automatically acquires and releases the connection
   */
  async execute<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
    const client = await this.acquire();
    try {
      return await fn(client);
    } finally {
      this.release(client);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    const active = this.connections.filter((conn) => conn.inUse).length;
    const idle = this.connections.filter((conn) => !conn.inUse).length;

    return {
      total: this.connections.length,
      active,
      idle,
      waiting: this.waitingQueue.length,
    };
  }

  /**
   * Drain the pool (close all connections)
   */
  async drain(): Promise<void> {
    this.isShuttingDown = true;
    console.log("[Redis Pool] Draining pool...");

    // Reject all waiting requests
    this.waitingQueue.forEach((waiting) => {
      const error = new Error("Pool is being drained");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (waiting as any)(Promise.reject(error));
    });
    this.waitingQueue = [];

    // Close all connections
    const closePromises = this.connections.map((conn) => conn.client.quit());
    await Promise.allSettled(closePromises);

    this.connections = [];
    console.log("[Redis Pool] Pool drained");
  }

  /**
   * Health check - verify pool is operational
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.acquire();
      const result = await client.ping();
      this.release(client);
      return result === "PONG";
    } catch (error) {
      console.error("[Redis Pool] Health check failed:", error);
      return false;
    }
  }
}
