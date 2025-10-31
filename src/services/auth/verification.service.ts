import crypto from "crypto";
import { UserModel, UserD } from "../../db/models/user";
import { VerificationTokenModel } from "../../db/models/verificationToken";
import { SendEmail } from "../../utils/Email";
import { readTextFile } from "../../utils/File";
import { formatString } from "../../utils/Strings";
import { FRONT_URL, PROJECT_Name } from "../../config/Env";
import { ErrorResponseC, SuccessResponseC } from "../services.response";
import { HttpCodes } from "../../config/Errors";
import verificationLogs, { verificationLogger } from "./verification.logs";

export class VerificationService {
	/**
	 * Generate a cryptographically secure verification token
	 * @returns {string} Random 32-byte hex token
	 */
	static generateToken(): string {
		return crypto.randomBytes(32).toString("hex");
	}

	/**
	 * Send verification email to user
	 * @param user - User document
	 * @param token - Verification token
	 * @returns {Promise<void>}
	 */
	static async sendVerificationEmail(user: UserD, token: string): Promise<void> {
		try {
			// Generate verification URL
			const verificationUrl = `${FRONT_URL}/verify-email?token=${token}`;

			// Load email template
			const templatePath = "./templates/emails/verify-email.html";
			let emailTemplate = readTextFile(templatePath);

			// Replace template variables using formatString
			emailTemplate = formatString(emailTemplate, {
				PROJECT_NAME: PROJECT_Name,
				FIRST_NAME: user.firstName,
				VERIFICATION_URL: verificationUrl,
				YEAR: new Date().getFullYear().toString()
			});

			// Send email
			await SendEmail({
				to: user.email,
				subject: `Verify your ${PROJECT_Name} account`,
				html: emailTemplate
			});

			const msg = formatString(verificationLogs.VERIFICATION_EMAIL_SENT.message, { email: user.email });
			verificationLogger.info(msg, { type: verificationLogs.VERIFICATION_EMAIL_SENT.type });
		} catch (error) {
			const msg = formatString(verificationLogs.VERIFICATION_EMAIL_SENT_ERROR.message, {
				email: user.email,
				error: (error as Error)?.message || ""
			});
			verificationLogger.error(msg, error as Error);
			throw new Error("Failed to send verification email");
		}
	}

	/**
	 * Create verification token and send email
	 * @param user - User document
	 * @returns {Promise<ResponseT>}
	 */
	static async createVerificationToken(user: UserD): Promise<ResponseT> {
		try {
			// Check if email is already verified
			if (user.emailVerified) {
				const msg = formatString(verificationLogs.EMAIL_ALREADY_VERIFIED.message, { email: user.email });
				verificationLogger.warn(msg);
				return new ErrorResponseC(
					"EMAIL_ALREADY_VERIFIED",
					HttpCodes.BadRequest.code,
					"Email is already verified"
				);
			}

			// Generate token
			const token = this.generateToken();
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			// Delete any existing tokens for this user
			await VerificationTokenModel.deleteMany({ userId: user._id });

			// Create new verification token
			await VerificationTokenModel.create({
				email: user.email,
				token,
				userId: user._id,
				expiresAt
			});

			// Update user with verification token
			user.verificationToken = token;
			user.verificationTokenExpires = expiresAt;
			await user.save();

			// Send verification email
			await this.sendVerificationEmail(user, token);

			const msg = formatString(verificationLogs.VERIFICATION_TOKEN_CREATED.message, { email: user.email });
			verificationLogger.info(msg, { type: verificationLogs.VERIFICATION_TOKEN_CREATED.type });

			return new SuccessResponseC(
				"VERIFICATION_EMAIL_SENT",
				null,
				"Verification email sent successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(verificationLogs.VERIFICATION_ERROR_GENERIC.message, {
				email: user.email,
				error: (error as Error)?.message || ""
			});
			verificationLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"VERIFICATION_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to send verification email"
			);
		}
	}

	/**
	 * Verify email using token
	 * @param token - Verification token
	 * @returns {Promise<ResponseT>}
	 */
	static async verifyEmail(token: string): Promise<ResponseT> {
		try {
			// Find verification token
			const verificationToken = await VerificationTokenModel.findOne({ token });

			if (!verificationToken) {
				const msg = formatString(verificationLogs.VERIFICATION_TOKEN_INVALID.message, { token });
				verificationLogger.warn(msg);
				return new ErrorResponseC(
					"INVALID_TOKEN",
					HttpCodes.BadRequest.code,
					"Invalid or expired verification token"
				);
			}

			// Check if token is expired
			if (verificationToken.expiresAt < new Date()) {
				await VerificationTokenModel.deleteOne({ _id: verificationToken._id });
				const msg = formatString(verificationLogs.VERIFICATION_TOKEN_EXPIRED.message, { token });
				verificationLogger.warn(msg);
				return new ErrorResponseC(
					"TOKEN_EXPIRED",
					HttpCodes.BadRequest.code,
					"Verification token has expired. Please request a new one."
				);
			}

			// Find user and update
			const user = await UserModel.findById(verificationToken.userId);

			if (!user) {
				const msg = formatString(verificationLogs.USER_NOT_FOUND_FOR_VERIFICATION.message, {
					userId: verificationToken.userId.toString()
				});
				verificationLogger.error(msg);
				return new ErrorResponseC(
					"USER_NOT_FOUND",
					HttpCodes.NotFound.code,
					"User not found"
				);
			}

			// Check if already verified
			if (user.emailVerified) {
				await VerificationTokenModel.deleteOne({ _id: verificationToken._id });
				const msg = formatString(verificationLogs.EMAIL_ALREADY_VERIFIED.message, { email: user.email });
				verificationLogger.warn(msg);
				return new ErrorResponseC(
					"EMAIL_ALREADY_VERIFIED",
					HttpCodes.BadRequest.code,
					"Email is already verified"
				);
			}

			// Update user as verified
			user.emailVerified = true;
			user.verificationToken = undefined;
			user.verificationTokenExpires = undefined;
			await user.save();

			// Delete the used token
			await VerificationTokenModel.deleteOne({ _id: verificationToken._id });

			const msg = formatString(verificationLogs.EMAIL_VERIFIED_SUCCESS.message, { email: user.email });
			verificationLogger.info(msg, { type: verificationLogs.EMAIL_VERIFIED_SUCCESS.type });

			return new SuccessResponseC(
				"EMAIL_VERIFIED",
				{ email: user.email },
				"Email verified successfully",
				HttpCodes.OK.code
			);
		} catch (error) {
			const msg = formatString(verificationLogs.VERIFICATION_ERROR_GENERIC.message, {
				email: "unknown",
				error: (error as Error)?.message || ""
			});
			verificationLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"VERIFICATION_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to verify email"
			);
		}
	}

	/**
	 * Resend verification email
	 * @param email - User email
	 * @returns {Promise<ResponseT>}
	 */
	static async resendVerificationEmail(email: string): Promise<ResponseT> {
		try {
			// Find user by email
			const user = await UserModel.findOne({ email });

			if (!user) {
				// Don't reveal if user exists for security
				const msg = formatString(verificationLogs.VERIFICATION_RESEND_SUCCESS.message, { email });
				verificationLogger.warn(msg);
				return new SuccessResponseC(
					"VERIFICATION_EMAIL_SENT",
					null,
					"If an account with that email exists, a verification email has been sent",
					HttpCodes.OK.code
				);
			}

			// Check if already verified
			if (user.emailVerified) {
				const msg = formatString(verificationLogs.EMAIL_ALREADY_VERIFIED.message, { email });
				verificationLogger.warn(msg);
				return new ErrorResponseC(
					"EMAIL_ALREADY_VERIFIED",
					HttpCodes.BadRequest.code,
					"Email is already verified"
				);
			}

			// Create new verification token and send email
			return await this.createVerificationToken(user);
		} catch (error) {
			const msg = formatString(verificationLogs.VERIFICATION_ERROR_GENERIC.message, {
				email,
				error: (error as Error)?.message || ""
			});
			verificationLogger.error(msg, error as Error);
			return new ErrorResponseC(
				"VERIFICATION_ERROR",
				HttpCodes.InternalServerError.code,
				"Failed to resend verification email"
			);
		}
	}
}
