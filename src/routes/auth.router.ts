import {
  loginValidators,
  registerValidators,
} from "../services/auth/auth.validator";
import {
  SignIn,
  SignUp,
  AuthBack,
  RefreshToken,
  Logout,
  VerifyEmail,
  ResendVerification,
  ForgotPassword,
  VerifyResetToken,
  ResetPassword,
  DeleteMyAccount,
  GetAccountStatus,
  LockUserAccount,
  UnlockUserAccount
} from "../controller/auth.controller";
import { Router } from "express";
import { validator } from "../middleware/validator";
import { checkLogs, isLoggedIn, isAdmin } from "../middleware/auth";
import { authLimiter, refreshLimiter } from "../middleware/rateLimit";

const authRouter = Router();

/**
 * POST /auth/login
 * @tags Authentication
 * @summary User login
 * @description Authenticate a user with email and password. Returns access and refresh tokens.
 * @param {LoginRequest} request.body.required - Login credentials
 * @returns {LoginResponse} 202 - Successfully logged in
 * @returns {ErrorResponse} 401 - Invalid credentials
 * @returns {ErrorResponse} 429 - Too many requests
 */
authRouter.route("/login").post(authLimiter, loginValidators, validator, SignIn);

/**
 * POST /auth/register
 * @tags Authentication
 * @summary Register new user
 * @description Create a new user account. Returns access and refresh tokens.
 * @param {RegisterRequest} request.body.required - Registration details
 * @returns {LoginResponse} 201 - Successfully registered
 * @returns {ErrorResponse} 400 - Email already exists
 * @returns {ErrorResponse} 429 - Too many requests
 */
authRouter.route("/register").post(authLimiter, registerValidators, validator, SignUp);

/**
 * POST /auth/refresh
 * @tags Authentication
 * @summary Refresh access token
 * @description Get a new access token using a valid refresh token.
 * @param {RefreshRequest} request.body.required - Refresh token
 * @returns {LoginResponse} 200 - Token refreshed successfully
 * @returns {ErrorResponse} 401 - Invalid or expired refresh token
 * @returns {ErrorResponse} 429 - Too many requests
 */
authRouter.route("/refresh").post(refreshLimiter, RefreshToken);

/**
 * POST /auth/logout
 * @tags Authentication
 * @summary Logout user
 * @description Blacklist the current access and refresh tokens.
 * @security bearerAuth
 * @security cookieAuth
 * @returns {object} 200 - Successfully logged out
 * @returns {ErrorResponse} 429 - Too many requests
 */
authRouter.route("/logout").post(authLimiter, Logout);

/**
 * GET /auth
 * @tags Authentication
 * @summary Get current user
 * @description Get the authenticated user's information.
 * @security bearerAuth
 * @security cookieAuth
 * @returns {LoginResponse} 202 - User information with refreshed tokens
 * @returns {ErrorResponse} 401 - Not authenticated
 */
authRouter.route("/").get(checkLogs,isLoggedIn,AuthBack);

/**
 * POST /auth/verify-email
 * @tags Email Verification
 * @summary Verify email address
 * @description Verify user's email address using the token sent to their email.
 * @param {VerifyEmailRequest} request.body.required - Verification token
 * @returns {object} 200 - Email verified successfully
 * @returns {ErrorResponse} 400 - Invalid or expired token
 */
authRouter.route("/verify-email").post(authLimiter, VerifyEmail);

/**
 * POST /auth/resend-verification
 * @tags Email Verification
 * @summary Resend verification email
 * @description Resend the email verification link to the user's email address.
 * @param {ResendVerificationRequest} request.body.required - User email
 * @returns {object} 200 - Verification email sent
 * @returns {ErrorResponse} 400 - Email already verified
 * @returns {ErrorResponse} 429 - Too many requests
 */
authRouter.route("/resend-verification").post(authLimiter, ResendVerification);

/**
 * POST /auth/forgot-password
 * @tags Password Reset
 * @summary Request password reset
 * @description Send a password reset link to the user's email address.
 * @param {ForgotPasswordRequest} request.body.required - User email
 * @returns {object} 200 - Password reset email sent
 * @returns {ErrorResponse} 429 - Too many requests
 */
authRouter.route("/forgot-password").post(authLimiter, ForgotPassword);

/**
 * POST /auth/verify-reset-token
 * @tags Password Reset
 * @summary Verify password reset token
 * @description Verify if a password reset token is valid and not expired.
 * @param {VerifyResetTokenRequest} request.body.required - Reset token
 * @returns {object} 200 - Token is valid
 * @returns {ErrorResponse} 400 - Invalid or expired token
 */
authRouter.route("/verify-reset-token").post(authLimiter, VerifyResetToken);

/**
 * POST /auth/reset-password
 * @tags Password Reset
 * @summary Reset password
 * @description Reset user password using the reset token.
 * @param {ResetPasswordRequest} request.body.required - Reset token and new password
 * @returns {object} 200 - Password reset successfully
 * @returns {ErrorResponse} 400 - Invalid token or password
 */
authRouter.route("/reset-password").post(authLimiter, ResetPassword);

/**
 * DELETE /auth/account
 * @tags Account Management
 * @summary Delete own account
 * @description Soft delete the authenticated user's account.
 * @security bearerAuth
 * @security cookieAuth
 * @returns {object} 200 - Account deleted successfully
 * @returns {ErrorResponse} 401 - Not authenticated
 */
authRouter.route("/account").delete(checkLogs, isLoggedIn, DeleteMyAccount);

/**
 * GET /auth/account/status
 * @tags Account Management
 * @summary Get account status
 * @description Get the authenticated user's account status information.
 * @security bearerAuth
 * @security cookieAuth
 * @returns {AccountStatusResponse} 200 - Account status retrieved
 * @returns {ErrorResponse} 401 - Not authenticated
 */
authRouter.route("/account/status").get(checkLogs, isLoggedIn, GetAccountStatus);

/**
 * POST /auth/admin/lock-account
 * @tags Admin - Account Management
 * @summary Lock user account
 * @description Lock a user's account (admin only).
 * @security bearerAuth
 * @security cookieAuth
 * @param {LockAccountRequest} request.body.required - User ID and reason
 * @returns {object} 200 - Account locked successfully
 * @returns {ErrorResponse} 400 - Missing required fields
 * @returns {ErrorResponse} 401 - Not authenticated
 * @returns {ErrorResponse} 403 - Not authorized (admin only)
 */
authRouter.route("/admin/lock-account").post(checkLogs, isLoggedIn, isAdmin, LockUserAccount);

/**
 * POST /auth/admin/unlock-account
 * @tags Admin - Account Management
 * @summary Unlock user account
 * @description Unlock a locked user account (admin only).
 * @security bearerAuth
 * @security cookieAuth
 * @param {UnlockAccountRequest} request.body.required - User ID
 * @returns {object} 200 - Account unlocked successfully
 * @returns {ErrorResponse} 400 - Missing required fields
 * @returns {ErrorResponse} 401 - Not authenticated
 * @returns {ErrorResponse} 403 - Not authorized (admin only)
 */
authRouter.route("/admin/unlock-account").post(checkLogs, isLoggedIn, isAdmin, UnlockUserAccount);

export default authRouter;
