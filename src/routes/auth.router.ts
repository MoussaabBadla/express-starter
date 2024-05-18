import {
  loginValidators,
  registerValidators,
} from "../services/auth/auth.validator";
import { SignIn, SignUp , AuthBack} from "../controller/auth.controller";
import { Router } from "express";
import { validator } from "../middleware/validator";
import { checkLogs, isLoggedIn, isAdmin, isUser } from "../middleware/auth";

const authRouter = Router();

authRouter.route("/login").post(loginValidators, validator, SignIn);
authRouter.route("/register").post(registerValidators, validator, SignUp);
authRouter.route("/").get(checkLogs,isLoggedIn,AuthBack);

export default authRouter;
