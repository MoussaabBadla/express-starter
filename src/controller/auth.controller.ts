import {Response } from "express";
import  { UserD } from "../db/models/user";
import { MyRequest } from "../types/Express";
import { ErrorResponse, SuccessResponse } from "../utils/Response";
import { AuthServices } from "../services/auth/auth.service";
import { ErrorResponseC, SuccessResponseC } from "../services/services.response";
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
