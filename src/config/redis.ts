import Redis from "ioredis";
import { log } from "../utils/Function";
import { InDev } from "./Env";
import { globalLogger } from "../utils/Logger";

/**
 * Redis configuration and connection management
 */

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = parseInt(process.env.REDIS_DB || "0", 10);

/**
 * Redis client instance
 */
export const redisClient = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
	password: REDIS_PASSWORD,
	db: REDIS_DB,
	retryStrategy(times) {
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
	maxRetriesPerRequest: 3,
	enableReadyCheck: true,
	lazyConnect: false,
});

// Redis event handlers
redisClient.on("connect", () => {
	log("🔴 Redis client is connecting...");
});

redisClient.on("ready", () => {
	log("🟢 Redis client is ready and connected.");
});

redisClient.on("error", (err) => {
	globalLogger.error("🔴 Redis Client Error:", err);
});

redisClient.on("close", () => {
	log("🟡 Redis connection closed.");
});

redisClient.on("reconnecting", () => {
	log("🟡 Redis client is reconnecting...");
});

/**
 * Gracefully disconnect Redis
 */
export async function disconnectRedis(): Promise<void> {
	try {
		await redisClient.quit();
		log("Redis disconnected gracefully.");
	} catch (error) {
		globalLogger.error("Error disconnecting Redis:", error);
		await redisClient.disconnect();
	}
}

/**
 * Redis helper functions
 */
export class RedisService {
	/**
	 * Set a key-value pair with optional expiration (in seconds)
	 */
	static async set(key: string, value: string, expirySeconds?: number): Promise<void> {
		if (expirySeconds) {
			await redisClient.setex(key, expirySeconds, value);
		} else {
			await redisClient.set(key, value);
		}
	}

	/**
	 * Get value by key
	 */
	static async get(key: string): Promise<string | null> {
		return await redisClient.get(key);
	}

	/**
	 * Delete one or more keys
	 */
	static async del(...keys: string[]): Promise<number> {
		return await redisClient.del(...keys);
	}

	/**
	 * Check if key exists
	 */
	static async exists(key: string): Promise<boolean> {
		const result = await redisClient.exists(key);
		return result === 1;
	}

	/**
	 * Set expiration on a key (in seconds)
	 */
	static async expire(key: string, seconds: number): Promise<boolean> {
		const result = await redisClient.expire(key, seconds);
		return result === 1;
	}

	/**
	 * Get remaining time to live for a key (in seconds)
	 */
	static async ttl(key: string): Promise<number> {
		return await redisClient.ttl(key);
	}

	/**
	 * Store JSON object
	 */
	static async setJSON(key: string, value: any, expirySeconds?: number): Promise<void> {
		const jsonString = JSON.stringify(value);
		await this.set(key, jsonString, expirySeconds);
	}

	/**
	 * Retrieve JSON object
	 */
	static async getJSON<T>(key: string): Promise<T | null> {
		const value = await this.get(key);
		if (!value) return null;
		try {
			return JSON.parse(value) as T;
		} catch (error) {
			globalLogger.error(`Error parsing JSON for key ${key}:`, error);
			return null;
		}
	}

	/**
	 * Add value to a set
	 */
	static async sadd(key: string, ...members: string[]): Promise<number> {
		return await redisClient.sadd(key, ...members);
	}

	/**
	 * Check if value is member of set
	 */
	static async sismember(key: string, member: string): Promise<boolean> {
		const result = await redisClient.sismember(key, member);
		return result === 1;
	}

	/**
	 * Remove value from set
	 */
	static async srem(key: string, ...members: string[]): Promise<number> {
		return await redisClient.srem(key, ...members);
	}

	/**
	 * Increment a counter
	 */
	static async incr(key: string): Promise<number> {
		return await redisClient.incr(key);
	}

	/**
	 * Decrement a counter
	 */
	static async decr(key: string): Promise<number> {
		return await redisClient.decr(key);
	}
}

// Export the client for advanced use cases
export default redisClient;
