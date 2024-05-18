import { EnvEmitter } from "../utils/Events";
import { exitProcess } from "../utils/Process";
import { log } from "../utils/Function";

import { ExitCodes } from "./Errors";
export function CheckEnv(Env_Field: string, exitCode: ICode) {
		if (!process.env[Env_Field]) {
			log(`🔴 Failed on loading env field => '${Env_Field}'`);
			exitProcess(exitCode, { field: Env_Field });
		}
		log(`🟢 Checking env field => '${Env_Field}' : ${process.env[Env_Field]}`);
	
	
	return process.env[Env_Field] as string;
}

// checkable env
log("---------------------------- Necessary ENV ----------------------------");
export const MONGODB_URI = CheckEnv("BACK_MONGODB_URI", ExitCodes.ENV_ERROR_COULDNT_FIND_FIELD);
export const MONGODB_NAME = CheckEnv("BACK_MONGODB_NAME", ExitCodes.ENV_ERROR_COULDNT_FIND_FIELD);
export const JWT_SECRET = CheckEnv("BACK_SECRET", ExitCodes.ENV_ERROR_COULDNT_FIND_FIELD);
export const EmailUser = CheckEnv("BACK_EmailUser", ExitCodes.ENV_ERROR_COULDNT_FIND_FIELD);
export const EmailPass = CheckEnv("BACK_EmailPass", ExitCodes.ENV_ERROR_COULDNT_FIND_FIELD);

log("--------------------------------------------------------\n");
EnvEmitter.emit("loaded");
