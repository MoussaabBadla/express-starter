import {Response } from "express";
import  { UserD } from "../db/models/user";
import { MyRequest } from "../types/Express";
import { ErrorResponse, SuccessResponse } from "../utils/Response";
import { AuthServices } from "../services/auth/auth.service";
import { ErrorResponseC, SuccessResponseC } from "../services/services.response";
import { VerificationService } from "../services/auth/verification.service";
import { PasswordResetService } from "../services/auth/passwordReset.service";
import { AccountManagementService } from "../services/auth/accountManagement.service";
export const SignIn = async (req: MyRequest<UserD>, res: Response,) => {
	const { email, password, stay = false  } = req.body;
	const result  = await AuthServices.executeLogin(email, password , stay , res);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message , result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error );
};
export const SignUp = async (req: MyRequest<UserD>, res: Response,) => {
	const { email, password, firstName, lastName  , stay = false } = req.body;
	const  result  = await AuthServices.executeRegister(email, password, firstName, lastName , stay , res);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message , result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error );
}


export const AuthBack = async (req:MyRequest<UserD>,res:Response) => {
	const { stay = false } = req.body;
	const resulte = await AuthServices.executeAuthBack(req.user! , stay , res);
	if (resulte instanceof SuccessResponseC) return SuccessResponse(res, resulte.code, resulte.data, resulte.message , resulte.status);
	if (resulte instanceof ErrorResponseC) return ErrorResponse(res, resulte.code, resulte.message, resulte.error );
}

export const RefreshToken = async (req: MyRequest<null>, res: Response) => {
	const { stay = false } = req.body;
	// Try to get refresh token from cookie or body
	const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

	if (!refreshToken) {
		return ErrorResponse(res, 401, "Refresh token is required");
	}

	const result = await AuthServices.executeRefreshToken(refreshToken, stay, res);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

export const Logout = async (req: MyRequest<null>, res: Response) => {
	// Get tokens from cookies or headers
	const accessToken = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
	const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

	const result = await AuthServices.executeLogout(accessToken, refreshToken, res);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

// ==================== Email Verification Controllers ====================

export const VerifyEmail = async (req: MyRequest<null>, res: Response) => {
	const { token } = req.body;

	if (!token) {
		return ErrorResponse(res, 400, "Verification token is required");
	}

	const result = await VerificationService.verifyEmail(token);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

export const ResendVerification = async (req: MyRequest<null>, res: Response) => {
	const { email } = req.body;

	if (!email) {
		return ErrorResponse(res, 400, "Email is required");
	}

	const result = await VerificationService.resendVerificationEmail(email);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

// ==================== Password Reset Controllers ====================

export const ForgotPassword = async (req: MyRequest<null>, res: Response) => {
	const { email } = req.body;

	if (!email) {
		return ErrorResponse(res, 400, "Email is required");
	}

	const result = await PasswordResetService.requestPasswordReset(email);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

export const VerifyResetToken = async (req: MyRequest<null>, res: Response) => {
	const { token } = req.body;

	if (!token) {
		return ErrorResponse(res, 400, "Reset token is required");
	}

	const result = await PasswordResetService.verifyResetToken(token);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

export const ResetPassword = async (req: MyRequest<null>, res: Response) => {
	const { token, password } = req.body;

	if (!token || !password) {
		return ErrorResponse(res, 400, "Token and new password are required");
	}

	const result = await PasswordResetService.resetPassword(token, password);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

// ==================== Account Management Controllers ====================

export const DeleteMyAccount = async (req: MyRequest<UserD>, res: Response) => {
	if (!req.user) {
		return ErrorResponse(res, 401, "User not authenticated");
	}

	const userId = req.user._id!.toString();
	const accessToken = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
	const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

	const result = await AccountManagementService.deleteAccount(userId, accessToken, refreshToken);

	// Clear cookies on successful deletion
	if (result instanceof SuccessResponseC) {
		res.clearCookie("token");
		res.clearCookie("refreshToken");
		return SuccessResponse(res, result.code, result.data, result.message, result.status);
	}

	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

export const GetAccountStatus = async (req: MyRequest<UserD>, res: Response) => {
	if (!req.user) {
		return ErrorResponse(res, 401, "User not authenticated");
	}

	const userId = req.user._id!.toString();

	const result = await AccountManagementService.getAccountStatus(userId);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

// ==================== Admin Account Management Controllers ====================

export const LockUserAccount = async (req: MyRequest<UserD>, res: Response) => {
	const { userId, reason } = req.body;

	if (!userId || !reason) {
		return ErrorResponse(res, 400, "User ID and reason are required");
	}

	const result = await AccountManagementService.lockAccount(userId, reason);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}

export const UnlockUserAccount = async (req: MyRequest<UserD>, res: Response) => {
	const { userId } = req.body;

	if (!userId) {
		return ErrorResponse(res, 400, "User ID is required");
	}

	const result = await AccountManagementService.unlockAccount(userId);
	if (result instanceof SuccessResponseC) return SuccessResponse(res, result.code, result.data, result.message, result.status);
	if (result instanceof ErrorResponseC) return ErrorResponse(res, result.code, result.message, result.error);
}
