import crypto from "crypto";
import { UserModel, UserD } from "../../db/models/user";
import { PasswordResetModel } from "../../db/models/passwordReset";
import { SendEmail } from "../../utils/Email";
import { readTextFile } from "../../utils/File";
import { formatString } from "../../utils/Strings";
import { FRONT_URL, PROJECT_Name } from "../../config/Env";
import { ErrorResponseC, SuccessResponseC } from "../services.response";
import { HttpCodes } from "../../config/Errors";
import passwordResetLogs, { passwordResetLogger } from "./passwordReset.logs";

export class PasswordResetService {
	/**
	 * Generate a cryptographically secure reset token
	 * @returns {string} Random 32-byte hex token
	 */
	static generateToken(): string {
		return crypto.randomBytes(32).toString("hex");
	}

	/**
	 * Send password reset email to user
	 * @param user - User document
	 * @param token - Reset token
	 * @returns {Promise<void>}
	 */
	static async sendPasswordResetEmail(user: UserD, token: string): Promise<void> {
		try {
			// Generate reset URL
			const resetUrl = `${FRONT_URL}/reset-password?token=${token}`;

			// Load email template
			const templatePath = "./templates/emails/reset-password.html";
			let emailTemplate = readTextFile(templatePath);

			// Replace template variables using formatString
			emailTemplate = formatString(emailTemplate, {
				PROJECT_NAME: PROJECT_Name,
				FIRST_NAME: user.firstName,
				RESET_URL: resetUrl,
				YEAR: new Date().getFullYear().toString()
			});

			// Send email
			await SendEmail({
				to: user.email,
				subject: `Reset your ${PROJECT_Name} password`,
				html: emailTemplate
			});

			const msg = formatString(passwordResetLogs.PASSWORD_RESET_EMAIL_SENT.message, { email: user.email });
			passwordResetLogger.info(msg, { type: passwordResetLogs.PASSWORD_RESET_EMAIL_SENT.type });
		} catch (error) {
			const msg = formatString(passwordResetLogs.PASSWORD_RESET_EMAIL_SENT_ERROR.message, {
				email: user.email,
				error: (error as Error)?.message || ""
			});
			passwordResetLogger.error(msg, error as Error);
			throw new Error("Failed to send password reset email");
		}
	}

	/**
	 * Request password reset
	 * @param email - User email
	 * @returns {Promise<ResponseT>}
	 */
	static async requestPasswordReset(email: string): Promise<ResponseT> {
		try {
			// Find user by email
			const user = await UserModel.findOne({ email });

			// Always return success to prevent user enumeration
			// Don't reveal if user exists
			if (!user) {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_REQUEST_NON_EXISTENT.message, { email });
				passwordResetLogger.warn(msg);
				return new SuccessResponseC(
					"PASSWORD_RESET_EMAIL_SENT",
					null,
					"If an account with that email exists, a password reset link has been sent",
					HttpCodes.OK.code
				);
			}

			// Check if account is locked or deleted
			if (user.accountStatus === "locked") {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_ACCOUNT_LOCKED.message, { email });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_LOCKED",
					HttpCodes.Forbidden.code,
					"This account has been locked. Please contact support."
				);
			}

			if (user.accountStatus === "deleted") {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_ACCOUNT_DELETED.message, { email });
				passwordResetLogger.warn(msg);
				return new SuccessResponseC(
					"PASSWORD_RESET_EMAIL_SENT",
					null,
					"If an account with that email exists, a password reset link has been sent",
					HttpCodes.OK.code
				);
			}

			// Generate token
			const token = this.generateToken();
			const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

			// Delete any existing reset tokens for this user
			await PasswordResetModel.deleteMany({ user: user._id });

			// Create new reset token
			await PasswordResetModel.create({
				email: user.email,
				token,
				user: user._id,
				expiresAt
			});

			// Send password reset email
			await this.sendPasswordResetEmail(user, token);

			const msg = formatString(passwordResetLogs.PASSWORD_RESET_TOKEN_CREATED.message, { email: user.email });
			passwordResetLogger.info(msg, { type: passwordResetLogs.PASSWORD_RESET_TOKEN_CREATED.type });

			return new SuccessResponseC(
				"PASSWORD_RESET_EMAIL_SENT",
				null,
				"Password reset email sent successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(passwordResetLogs.PASSWORD_RESET_ERROR_GENERIC.message, {
				email,
				error: (error as Error)?.message || ""
			});
			passwordResetLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"PASSWORD_RESET_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to process password reset request"
			);
		}
	}

	/**
	 * Verify reset token
	 * @param token - Reset token
	 * @returns {Promise<ResponseT>}
	 */
	static async verifyResetToken(token: string): Promise<ResponseT> {
		try {
			// Find reset token
			const resetToken = await PasswordResetModel.findOne({ token });

			if (!resetToken) {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_TOKEN_INVALID.message, { token });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"INVALID_TOKEN",
					HttpCodes.BadRequest.code,
					"Invalid or expired reset token"
				);
			}

			// Check if token is expired
			if (resetToken.expiresAt < new Date()) {
				await PasswordResetModel.deleteOne({ _id: resetToken._id });
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_TOKEN_EXPIRED.message, { token });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"TOKEN_EXPIRED",
					HttpCodes.BadRequest.code,
					"Reset token has expired. Please request a new one."
				);
			}

			return new SuccessResponseC(
				"TOKEN_VALID",
				{ email: resetToken.email },
				"Token is valid",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(passwordResetLogs.PASSWORD_RESET_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			passwordResetLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"PASSWORD_RESET_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to verify reset token"
			);
		}
	}

	/**
	 * Reset password using token
	 * @param token - Reset token
	 * @param newPassword - New password
	 * @returns {Promise<ResponseT>}
	 */
	static async resetPassword(token: string, newPassword: string): Promise<ResponseT> {
		try {
			// Find reset token
			const resetToken = await PasswordResetModel.findOne({ token });

			if (!resetToken) {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_TOKEN_INVALID.message, { token });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"INVALID_TOKEN",
					HttpCodes.BadRequest.code,
					"Invalid or expired reset token"
				);
			}

			// Check if token is expired
			if (resetToken.expiresAt < new Date()) {
				await PasswordResetModel.deleteOne({ _id: resetToken._id });
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_TOKEN_EXPIRED.message, { token });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"TOKEN_EXPIRED",
					HttpCodes.BadRequest.code,
					"Reset token has expired. Please request a new one."
				);
			}

			// Find user
			const user = await UserModel.findById(resetToken.user);

			if (!user) {
				const msg = formatString(passwordResetLogs.USER_NOT_FOUND_FOR_RESET.message, {
					userId: resetToken.user.toString()
				});
				passwordResetLogger.error(msg);
				return new ErrorResponseC(
					"USER_NOT_FOUND",
					HttpCodes.NotFound.code,
					"User not found"
				);
			}

			// Check if account is locked or deleted
			if (user.accountStatus === "locked") {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_ACCOUNT_LOCKED.message, { email: user.email });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_LOCKED",
					HttpCodes.Forbidden.code,
					"This account has been locked. Please contact support."
				);
			}

			if (user.accountStatus === "deleted") {
				const msg = formatString(passwordResetLogs.PASSWORD_RESET_ACCOUNT_DELETED.message, { email: user.email });
				passwordResetLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_DELETED",
					HttpCodes.Forbidden.code,
					"This account has been deleted"
				);
			}

			// Update password
			user.password = newPassword;
			await user.save();

			// Delete the used token and all other reset tokens for this user
			await PasswordResetModel.deleteMany({ user: user._id });

			const msg = formatString(passwordResetLogs.PASSWORD_RESET_SUCCESS.message, { email: user.email });
			passwordResetLogger.info(msg, { type: passwordResetLogs.PASSWORD_RESET_SUCCESS.type });

			return new SuccessResponseC(
				"PASSWORD_RESET_SUCCESS",
				{ email: user.email },
				"Password reset successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(passwordResetLogs.PASSWORD_RESET_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			passwordResetLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"PASSWORD_RESET_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to reset password"
			);
		}
	}
}
