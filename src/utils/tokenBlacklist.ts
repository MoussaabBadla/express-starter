import { RedisService } from "../config/redis";
import { Decode } from "./jwt";

const BLACKLIST_PREFIX = "token:blacklist:";

/**
 * Add a token to the blacklist
 * @param token - JWT token to blacklist
 * @returns Promise<void>
 */
export async function blacklistToken(token: string): Promise<void> {
	const decoded = Decode(token);
	if (!decoded || !decoded.exp) {
		throw new Error("Invalid token: cannot determine expiration");
	}

	const key = `${BLACKLIST_PREFIX}${token}`;
	const now = Math.floor(Date.now() / 1000);
	const ttl = decoded.exp - now;

	if (ttl > 0) {
		// Store token in blacklist with TTL matching token expiration
		await RedisService.set(key, "1", ttl);
	}
}

/**
 * Check if a token is blacklisted
 * @param token - JWT token to check
 * @returns Promise<boolean> - true if blacklisted, false otherwise
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
	const key = `${BLACKLIST_PREFIX}${token}`;
	return await RedisService.exists(key);
}

/**
 * Blacklist all tokens for a specific user (useful for security events)
 * @param userId - User ID
 * @param expirySeconds - How long to keep the blacklist (default 7 days for refresh token expiry)
 */
export async function blacklistAllUserTokens(userId: string, expirySeconds: number = 7 * 24 * 60 * 60): Promise<void> {
	const key = `${BLACKLIST_PREFIX}user:${userId}`;
	await RedisService.set(key, "1", expirySeconds);
}

/**
 * Check if all tokens for a user are blacklisted
 * @param userId - User ID
 * @returns Promise<boolean>
 */
export async function areAllUserTokensBlacklisted(userId: string): Promise<boolean> {
	const key = `${BLACKLIST_PREFIX}user:${userId}`;
	return await RedisService.exists(key);
}
