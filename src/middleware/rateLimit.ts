import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redis";
import { InDev, InTest } from "../config/Env";

/**
 * Create Redis store for rate limiting
 * Only use Redis in non-test environments
 */
const createStore = (prefix: string) => {
	if (InTest) {
		// Use default memory store in test environment
		return undefined;
	}
	return new RedisStore({
		// @ts-ignore - Known typing issue with rate-limit-redis
		client: redisClient,
		prefix,
	});
};

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: InDev ? 1000 : 100, // Higher limit in development
	message: {
		status: "error",
		message: "Too many requests from this IP, please try again later.",
		code: 429,
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	store: createStore("rl:api:"),
	skip: (req) => {
		// Skip rate limiting for health check endpoint
		return req.path === "/health";
	},
});

/**
 * Authentication rate limiter (stricter)
 * Limits: 5 requests per 15 minutes per IP for login/register
 */
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: InDev ? 100 : 5, // Much higher in development, strict in production
	message: {
		status: "error",
		message: "Too many authentication attempts from this IP, please try again after 15 minutes.",
		code: 429,
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false, // Count successful requests
	skipFailedRequests: false, // Count failed requests
	store: createStore("rl:auth:"),
});

/**
 * Refresh token rate limiter
 * Limits: 10 requests per hour per IP
 */
export const refreshLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: InDev ? 100 : 10,
	message: {
		status: "error",
		message: "Too many token refresh attempts, please try again later.",
		code: 429,
	},
	standardHeaders: true,
	legacyHeaders: false,
	store: createStore("rl:refresh:"),
});

/**
 * File upload rate limiter
 * Limits: 20 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: InDev ? 100 : 20,
	message: {
		status: "error",
		message: "Too many file uploads, please try again later.",
		code: 429,
	},
	standardHeaders: true,
	legacyHeaders: false,
	store: createStore("rl:upload:"),
});
