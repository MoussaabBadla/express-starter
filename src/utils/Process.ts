import { ExitCodes } from "../config/Errors";
import { SendEmail } from "./Email";
import { formatString } from "./Strings";
import {  DEV_Email, InDev, PROJECT_Name } from "../config/Env";
import { globalLogger as logger } from "./Logger";

export async function exitProcess(code: ICode, moreData: Record<string, string> = {}) {
	const exitCode = code || ExitCodes.ERROR_GENERIC;
	const message = formatString(exitCode.message, moreData);

	logger.error(message, { code: exitCode.code, type: "ExitCode" });

	console.error(`📛 Exiting with code: ${exitCode.code}`);
	console.error("❌ Reason:", message);
	if (!InDev) {
		const email = { text: " `${PROJECT_Name} ❌ Back-end shutdown unexpectedly " + exitCode.code };
		await SendEmail({
			to: DEV_Email,
			subject: `${PROJECT_Name} Back-end shutdown unexpectedly`,
			...email,
		})
			.then(() => {
				process.exit(exitCode.code);
			})
			.catch((err) => {
				console.error("❌ => Sending email on exit :", err);
			});
	} else {
		process.exit(exitCode.code);
	}
}

