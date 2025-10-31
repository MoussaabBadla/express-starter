import { NextFunction, Request, Response } from "express";
import { MyRequest, UsersTypes } from "../types/Express";
import { ErrorResponse } from "../utils/Response";
import { HttpCodes } from "../config/Errors";
import { VerifyAccessToken } from "../utils/jwt";
import authLogs, { authLogger } from "../services/auth/auth.logs";
import  {UserModel, UserD } from "../db/models/user";
import { isTokenBlacklisted, areAllUserTokensBlacklisted } from "../utils/tokenBlacklist";



/**
 * @description  Extract the token from the request
 * @param {Request} req - The request object
 * @returns {string | null} - The token or null
 * 
 * ```ts
 * const token = extractAuth(req);
 * ```
 */

function extractAuth(req: Request): string | null {
	const authHeader = req.headers["authorization"];
	if (authHeader && authHeader.startsWith("Bearer ")) return authHeader.slice(7);
	if (req.cookies.token) return req.cookies.token;
	return null;

}

/**
 * @description  Check if the user is logged in
 * @param {MyRequest<null | UsersTypes>} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns
 * - {Response} - The response object
 * - {NextFunction} - The next function
 * 	
 */

export const checkLogs = async (req: MyRequest<null | UsersTypes>, res: Response, next: NextFunction) => {
	const token = extractAuth(req);

	req.user = null;
	if (token) {
		try {
			// Check if token is blacklisted
			const isBlacklisted = await isTokenBlacklisted(token);
			if (isBlacklisted) {
				authLogger.warn("Attempt to use blacklisted token");
				return ErrorResponse(
					res,
					HttpCodes.Unauthorized.code,
					"Token has been revoked",
					{ type: "TOKEN_BLACKLISTED" }
				);
			}

			const payload = VerifyAccessToken(token);
			if (!payload || !payload._id || !payload.role)
				return ErrorResponse(
					res,
					HttpCodes.Unauthorized.code,
					authLogs.ERROR_WHILE_CHECKING_CREDENTIALS.message,
					authLogs.ERROR_WHILE_CHECKING_CREDENTIALS
				);
			const { _id } = payload;

			// Check if all user tokens are blacklisted (security event)
			const allUserTokensBlacklisted = await areAllUserTokensBlacklisted(_id);
			if (allUserTokensBlacklisted) {
				authLogger.warn(`All tokens blacklisted for user: ${_id}`);
				return ErrorResponse(
					res,
					HttpCodes.Unauthorized.code,
					"All user sessions have been revoked for security reasons",
					{ type: "ALL_TOKENS_REVOKED" }
				);
			}

			const user = await UserModel.findOne({ _id, });
			if (!user) {
				authLogger.warn(`Token used for non-existent user: ${_id}`);
				return ErrorResponse(
					res,
					HttpCodes.Unauthorized.code,
					authLogs.ERROR_WHILE_CHECKING_CREDENTIALS.message,
					authLogs.ERROR_WHILE_CHECKING_CREDENTIALS
				);
			}
			req.user = user;
		} catch (e) {
			const error = e as Error;
			authLogger.error(`Token verification failed: ${error.message}`);
			return ErrorResponse(res, HttpCodes.Unauthorized.code, error.message || authLogs.ERROR_WHILE_CHECKING_CREDENTIALS.message, e);
		}
	}

	return next();
};

/**
 * @description  Check if the user is admin
 * @param {MyRequest<UserD>} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns
 * - {Response} - The response object
 * - {NextFunction} - The next function
 * 	
 */

export const isAdmin = (req: MyRequest<UserD>, res: Response, next: NextFunction) => {
	const user = req.user as UserD;
	if (user.role === "admin") return next();
	return ErrorResponse(res, HttpCodes.Unauthorized.code, authLogs.USER_ISN_T_ADMIN.message, authLogs.USER_ISN_T_ADMIN);
};




/**
 * @description  Check if the user is a only a user
 * @param {MyRequest<UserD>} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns
 * - {Response} - The response object
 * - {NextFunction} - The next function
 */

export const isUser = (req: MyRequest<UserD>, res: Response, next: NextFunction) => {
	const user = req.user as UserD;
	if (user.role === "user") return next();
	return ErrorResponse(res, HttpCodes.Unauthorized.code, authLogs.USER_ISN_T_USER.message, authLogs.USER_ISN_T_USER);
}

/**
 * @description  Check if the user is logged in
 * @param {MyRequest<UserD>} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns
 * - {Response} - The response object
 * - {NextFunction} - The next function
 * 	
 */

export const isLoggedIn = (req: MyRequest<UsersTypes>, res: Response, next: NextFunction) => {
	if (req.user) {
		if (req.user.enable) return next();
		return ErrorResponse(res, HttpCodes.Unauthorized.code, authLogs.USER_ISN_T_ENABLED.message, authLogs.USER_ISN_T_ENABLED);
	}
	return ErrorResponse(res, HttpCodes.Unauthorized.code, authLogs.USER_ISN_T_LOGGED.message, authLogs.USER_ISN_T_LOGGED);
};