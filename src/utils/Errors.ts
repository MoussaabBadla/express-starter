import { Request, Response } from "express";
import { InDev } from "../config/Env";
import { ExitCodes, HttpCodes } from "../config/Errors";

export function getErrorMessageByCode(code: number): string | undefined {
    for (const key in ExitCodes) {
        if (ExitCodes.hasOwnProperty(key) && ExitCodes[key as IExitCodes].code === code) {
            return ExitCodes[key as IExitCodes].message;
        }
    }
    return undefined; // Code not found in ExitCodes
}


/**
 * @description  this class is used to handle errors
 * @params {string} message - The message of the error
 * @params {number} statusCode - The status code of the error
 * @returns {AppError} - The error object
 * 
 * ```ts
 * throw new AppError("Error message", 500);
 * ```
 */
export class AppError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * @description  this class is used to handle http errors
 * @params   {ICode} httpError - The http error object
 * @params   {string} cause - The cause of the error
 * @returns - {AppHttpError} - The error object
 * 
 * ```ts
 * throw new AppHttpError(HttpCodes.BadRequest, "Error message");
 * ```
 * 
 */
export class AppHttpError extends AppError {
    cause: string;
    constructor(public httpError: ICode, cause: string) {
        super(httpError.message, httpError.code);
        this.cause = cause;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * @description this middleware function is used to handle errors 
 * @param error {AppError} - The error object
 * @param req  {Request} - express request object
 * @param res  {Response} - express response object
 * @param next  {NextFunction} - express next function
 * @returns
 *  - {Response} - express response object
 * 
 * 
 * 
 * 
 */

export function errorMiddleware(error: AppError, req: Request, res: Response,) {
    const status = error.statusCode || HttpCodes.InternalServerError.code;
    const message = error.message || HttpCodes.InternalServerError.message;
    const errorDetails = InDev ? error : undefined;
    
  return res.status(status).json({
        status,
        message,
        error: errorDetails,
    });
}
