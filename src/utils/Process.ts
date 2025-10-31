import { ExitCodes } from "../config/Errors";
import { SendEmail } from "./Email";
import { formatString } from "./Strings";
import {  DEV_Email, InDev, PROJECT_Name } from "../config/Env";
import { globalLogger as logger } from "./Logger";

export async function exitProcess(code: ICode, moreData: Record<string, string> = {}) {
	const exitCode = code || ExitCodes.ERROR_GENERIC;
	const message = formatString(exitCode.message, moreData);

	logger.error(message, { code: exitCode.code, type: "ExitCode" });

	logger.error(`📛 Exiting with code: ${exitCode.code}`);
	logger.error("❌ Reason:", message);
	if (!InDev) {
		try {
			const emailText = `${PROJECT_Name} ❌ Back-end shutdown unexpectedly with code ${exitCode.code}\n\nReason: ${message}`;
			await SendEmail({
				to: DEV_Email,
				subject: `${PROJECT_Name} Back-end shutdown unexpectedly`,
				text: emailText,
			});
			logger.info("Exit notification email sent successfully");
		} catch (err) {
			logger.error("Failed to send exit notification email:", err);
			// Don't prevent exit if email fails
		}
	}
	process.exit(exitCode.code);
}

