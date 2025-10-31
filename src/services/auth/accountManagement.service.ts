import { UserModel, UserD } from "../../db/models/user";
import { SendEmail } from "../../utils/Email";
import { readTextFile } from "../../utils/File";
import { formatString } from "../../utils/Strings";
import { PROJECT_Name } from "../../config/Env";
import { ErrorResponseC, SuccessResponseC } from "../services.response";
import { HttpCodes } from "../../config/Errors";
import { blacklistToken } from "../../utils/tokenBlacklist";
import accountManagementLogs, { accountManagementLogger } from "./accountManagement.logs";

export class AccountManagementService {
	/**
	 * Send account deleted email
	 * @param user - User document
	 * @returns {Promise<void>}
	 */
	static async sendAccountDeletedEmail(user: UserD): Promise<void> {
		try {
			// Load email template
			const templatePath = "./templates/emails/account-deleted.html";
			let emailTemplate = readTextFile(templatePath);

			// Replace template variables using formatString
			emailTemplate = formatString(emailTemplate, {
				PROJECT_NAME: PROJECT_Name,
				FIRST_NAME: user.firstName,
				YEAR: new Date().getFullYear().toString()
			});

			// Send email
			await SendEmail({
				to: user.email,
				subject: `${PROJECT_Name} account deleted`,
				html: emailTemplate
			});

			const msg = formatString(accountManagementLogs.ACCOUNT_DELETION_EMAIL_SENT.message, { email: user.email });
			accountManagementLogger.info(msg, { type: accountManagementLogs.ACCOUNT_DELETION_EMAIL_SENT.type });
		} catch (error) {
			const msg = formatString(accountManagementLogs.ACCOUNT_DELETION_EMAIL_ERROR.message, {
				email: user.email,
				error: (error as Error)?.message || ""
			});
			accountManagementLogger.error(msg, error as Error);
			// Don't throw error - deletion should succeed even if email fails
		}
	}

	/**
	 * Send account locked email
	 * @param user - User document
	 * @param reason - Reason for locking
	 * @returns {Promise<void>}
	 */
	static async sendAccountLockedEmail(user: UserD, reason: string): Promise<void> {
		try {
			// Load email template
			const templatePath = "./templates/emails/account-locked.html";
			let emailTemplate = readTextFile(templatePath);

			// Replace template variables using formatString
			emailTemplate = formatString(emailTemplate, {
				PROJECT_NAME: PROJECT_Name,
				FIRST_NAME: user.firstName,
				LOCK_REASON: reason,
				YEAR: new Date().getFullYear().toString()
			});

			// Send email
			await SendEmail({
				to: user.email,
				subject: `${PROJECT_Name} account locked`,
				html: emailTemplate
			});

			const msg = formatString(accountManagementLogs.ACCOUNT_LOCKED_EMAIL_SENT.message, { email: user.email });
			accountManagementLogger.info(msg, { type: accountManagementLogs.ACCOUNT_LOCKED_EMAIL_SENT.type });
		} catch (error) {
			const msg = formatString(accountManagementLogs.ACCOUNT_LOCKED_EMAIL_ERROR.message, {
				email: user.email,
				error: (error as Error)?.message || ""
			});
			accountManagementLogger.error(msg, error as Error);
			// Don't throw error - locking should succeed even if email fails
		}
	}

	/**
	 * Soft delete user account
	 * @param userId - User ID
	 * @param accessToken - User's access token to blacklist (optional)
	 * @param refreshToken - User's refresh token to blacklist (optional)
	 * @returns {Promise<ResponseT>}
	 */
	static async deleteAccount(
		userId: string,
		accessToken?: string,
		refreshToken?: string
	): Promise<ResponseT> {
		try {
			const user = await UserModel.findById(userId);

			if (!user) {
				const msg = formatString(accountManagementLogs.USER_NOT_FOUND_FOR_ACCOUNT_ACTION.message, { userId });
				accountManagementLogger.error(msg);
				return new ErrorResponseC(
					"USER_NOT_FOUND",
					HttpCodes.NotFound.code,
					"User not found"
				);
			}

			// Check if already deleted
			if (user.accountStatus === "deleted") {
				const msg = formatString(accountManagementLogs.ACCOUNT_ALREADY_DELETED.message, { email: user.email });
				accountManagementLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_ALREADY_DELETED",
					HttpCodes.BadRequest.code,
					"Account is already deleted"
				);
			}

			// Soft delete account
			user.accountStatus = "deleted";
			user.deletedAt = new Date();
			user.enable = false;
			await user.save();

			// Blacklist tokens if provided
			if (accessToken) {
				await blacklistToken(accessToken);
			}
			if (refreshToken) {
				await blacklistToken(refreshToken);
			}

			// Send deletion confirmation email
			await this.sendAccountDeletedEmail(user);

			const msg = formatString(accountManagementLogs.ACCOUNT_DELETED_SUCCESS.message, { email: user.email });
			accountManagementLogger.info(msg, { type: accountManagementLogs.ACCOUNT_DELETED_SUCCESS.type });

			return new SuccessResponseC(
				"ACCOUNT_DELETED",
				null,
				"Account deleted successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(accountManagementLogs.ACCOUNT_MANAGEMENT_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			accountManagementLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"ACCOUNT_DELETE_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to delete account"
			);
		}
	}

	/**
	 * Lock user account (Admin only)
	 * @param userId - User ID to lock
	 * @param reason - Reason for locking
	 * @returns {Promise<ResponseT>}
	 */
	static async lockAccount(userId: string, reason: string): Promise<ResponseT> {
		try {
			const user = await UserModel.findById(userId);

			if (!user) {
				const msg = formatString(accountManagementLogs.USER_NOT_FOUND_FOR_ACCOUNT_ACTION.message, { userId });
				accountManagementLogger.error(msg);
				return new ErrorResponseC(
					"USER_NOT_FOUND",
					HttpCodes.NotFound.code,
					"User not found"
				);
			}

			// Check if already locked
			if (user.accountStatus === "locked") {
				const msg = formatString(accountManagementLogs.ACCOUNT_ALREADY_LOCKED.message, { email: user.email });
				accountManagementLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_ALREADY_LOCKED",
					HttpCodes.BadRequest.code,
					"Account is already locked"
				);
			}

			// Check if deleted
			if (user.accountStatus === "deleted") {
				const msg = formatString(accountManagementLogs.CANNOT_LOCK_DELETED_ACCOUNT.message, { email: user.email });
				accountManagementLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_DELETED",
					HttpCodes.BadRequest.code,
					"Cannot lock a deleted account"
				);
			}

			// Lock account
			user.accountStatus = "locked";
			user.lockedAt = new Date();
			user.lockedReason = reason;
			user.enable = false;
			await user.save();

			// Send locked notification email
			await this.sendAccountLockedEmail(user, reason);

			const msg = formatString(accountManagementLogs.ACCOUNT_LOCKED_SUCCESS.message, {
				email: user.email,
				reason
			});
			accountManagementLogger.info(msg, { type: accountManagementLogs.ACCOUNT_LOCKED_SUCCESS.type });

			return new SuccessResponseC(
				"ACCOUNT_LOCKED",
				{ email: user.email, reason },
				"Account locked successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(accountManagementLogs.ACCOUNT_MANAGEMENT_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			accountManagementLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"ACCOUNT_LOCK_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to lock account"
			);
		}
	}

	/**
	 * Unlock user account (Admin only)
	 * @param userId - User ID to unlock
	 * @returns {Promise<ResponseT>}
	 */
	static async unlockAccount(userId: string): Promise<ResponseT> {
		try {
			const user = await UserModel.findById(userId);

			if (!user) {
				const msg = formatString(accountManagementLogs.USER_NOT_FOUND_FOR_ACCOUNT_ACTION.message, { userId });
				accountManagementLogger.error(msg);
				return new ErrorResponseC(
					"USER_NOT_FOUND",
					HttpCodes.NotFound.code,
					"User not found"
				);
			}

			// Check if not locked
			if (user.accountStatus !== "locked") {
				const msg = formatString(accountManagementLogs.ACCOUNT_NOT_LOCKED.message, { email: user.email });
				accountManagementLogger.warn(msg);
				return new ErrorResponseC(
					"ACCOUNT_NOT_LOCKED",
					HttpCodes.BadRequest.code,
					"Account is not locked"
				);
			}

			// Unlock account
			user.accountStatus = "active";
			user.lockedAt = undefined;
			user.lockedReason = undefined;
			user.enable = true;
			await user.save();

			const msg = formatString(accountManagementLogs.ACCOUNT_UNLOCKED_SUCCESS.message, { email: user.email });
			accountManagementLogger.info(msg, { type: accountManagementLogs.ACCOUNT_UNLOCKED_SUCCESS.type });

			return new SuccessResponseC(
				"ACCOUNT_UNLOCKED",
				{ email: user.email },
				"Account unlocked successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(accountManagementLogs.ACCOUNT_MANAGEMENT_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			accountManagementLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"ACCOUNT_UNLOCK_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to unlock account"
			);
		}
	}

	/**
	 * Get account status
	 * @param userId - User ID
	 * @returns {Promise<ResponseT>}
	 */
	static async getAccountStatus(userId: string): Promise<ResponseT> {
		try {
			const user = await UserModel.findById(userId).select(
				"accountStatus emailVerified lockedAt lockedReason deletedAt"
			);

			if (!user) {
				const msg = formatString(accountManagementLogs.USER_NOT_FOUND_FOR_ACCOUNT_ACTION.message, { userId });
				accountManagementLogger.error(msg);
				return new ErrorResponseC(
					"USER_NOT_FOUND",
					HttpCodes.NotFound.code,
					"User not found"
				);
			}

			return new SuccessResponseC(
				"ACCOUNT_STATUS_RETRIEVED",
				{
					accountStatus: user.accountStatus,
					emailVerified: user.emailVerified,
					lockedAt: user.lockedAt,
					lockedReason: user.lockedReason,
					deletedAt: user.deletedAt
				},
				"Account status retrieved successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(accountManagementLogs.ACCOUNT_MANAGEMENT_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			accountManagementLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"ACCOUNT_STATUS_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to get account status"
			);
		}
	}
}
