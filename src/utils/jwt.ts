import { JWT_SECRET } from "../config/Env";
import jwt from "jsonwebtoken";

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

/**
 * Sign a JWT access token with expiration
 * @param payload - The payload to sign (without type field)
 * @returns Signed JWT access token
 */
export const Sign = (payload: Omit<MyPayload, "type">): string => {
	return jwt.sign({ ...payload, type: "access" }, JWT_SECRET, {
		expiresIn: ACCESS_TOKEN_EXPIRY,
	});
};

/**
 * Sign a JWT refresh token with longer expiration
 * @param payload - The payload to sign (without type field)
 * @returns Signed JWT refresh token
 */
export const SignRefreshToken = (payload: Omit<MyPayload, "type">): string => {
	return jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, {
		expiresIn: REFRESH_TOKEN_EXPIRY,
	});
};

/**
 * Generate both access and refresh tokens
 * @param payload - The payload to sign
 * @returns Object containing both tokens
 */
export const GenerateTokenPair = (payload: Omit<MyPayload, "type">): TokenPair => {
	return {
		accessToken: Sign(payload),
		refreshToken: SignRefreshToken(payload),
	};
};

/**
 * Verify a JWT token and return the payload
 * @param token - The token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export const Verify = (token: string): MyPayload => {
	try {
		return jwt.verify(token, JWT_SECRET) as MyPayload;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new Error("Token has expired");
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new Error("Invalid token");
		}
		throw error;
	}
};

/**
 * Verify if token is a valid access token
 * @param token - The token to verify
 * @returns Decoded payload if valid access token
 * @throws Error if not an access token
 */
export const VerifyAccessToken = (token: string): MyPayload => {
	const payload = Verify(token);
	if (payload.type !== "access") {
		throw new Error("Invalid token type: expected access token");
	}
	return payload;
};

/**
 * Verify if token is a valid refresh token
 * @param token - The token to verify
 * @returns Decoded payload if valid refresh token
 * @throws Error if not a refresh token
 */
export const VerifyRefreshToken = (token: string): MyPayload => {
	const payload = Verify(token);
	if (payload.type !== "refresh") {
		throw new Error("Invalid token type: expected refresh token");
	}
	return payload;
};

/**
 * Decode a token without verification (useful for debugging)
 * @param token - The token to decode
 * @returns Decoded payload or null
 */
export const Decode = (token: string): MyPayload | null => {
	try {
		return jwt.decode(token) as MyPayload;
	} catch {
		return null;
	}
};
