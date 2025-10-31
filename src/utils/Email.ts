import { EnvEmitter } from "./Events";
import { EmailHost, EmailPort, EmailPass, EmailUser } from "../config/Env";
import nodemailer, { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Logger from "./Logger";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const mailLogger = new Logger("mail");

class EmailQueue {
	private initPromise: Promise<Transporter<SMTPTransport.SentMessageInfo>>;
	private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
	private isReady: boolean = false;

	constructor() {
		this.initPromise = new Promise((resolve, reject) => {
			EnvEmitter.addListener("loaded", () => {
				try {
					const transporter = nodemailer.createTransport({
						host: EmailHost,
						port: parseInt(EmailPort),
						secure: true,
						auth: {
							user: EmailUser,
							pass: EmailPass,
						},
					});

					transporter.verify((error) => {
						if (error) {
							mailLogger.error("Email server verification failed:", error);
							mailLogger.warn("Email functionality will be disabled");
							reject(error);
						} else {
							mailLogger.info("✉️ Email server is ready");
							this.transporter = transporter;
							this.isReady = true;
							resolve(transporter);
						}
					});
				} catch (error) {
					mailLogger.error("Failed to create email transporter:", error);
					reject(error);
				}
			});
		});
	}

	async addEmail(options: Mail.Options): Promise<void> {
		try {
			// Wait for transporter to be ready
			await this.initPromise;

			if (!this.transporter) {
				throw new Error("Email transporter not initialized");
			}

			const info = await this.transporter.sendMail({
				...options,
				from: options.from || EmailUser
			});

			mailLogger.info("Email sent successfully!", {
				messageId: info.messageId,
				to: options.to
			});
		} catch (error) {
			mailLogger.error("Failed to send email:", {
				error: (error as Error).message,
				to: options.to,
				subject: options.subject
			});
			throw error;
		}
	}

	async isEmailReady(): Promise<boolean> {
		try {
			await this.initPromise;
			return this.isReady;
		} catch {
			return false;
		}
	}
}

const emailQueue = new EmailQueue();

/**
 * Send an email via nodemailer
 * @param options - Mail options (to, subject, text, html, etc.)
 * @returns Promise that resolves when email is sent
 * @throws Error if email fails to send
 */
export async function SendEmail(options: Mail.Options): Promise<void> {
	return emailQueue.addEmail(options);
}

/**
 * Check if email service is ready
 * @returns Promise<boolean> indicating if email is configured and ready
 */
export async function isEmailServiceReady(): Promise<boolean> {
	return emailQueue.isEmailReady();
}
