import { UserD, UserModel } from "../../db/models/user";
import authLogs, { IAuthLogs, authLogger } from "./auth.logs";
import { formatString } from "../../utils/Strings";
import { GenerateTokenPair, VerifyRefreshToken } from "../../utils/jwt";
import { HttpCodes } from "../../config/Errors";
import { ErrorResponseC, SuccessResponseC } from "./../services.response";
import {Response } from "express";
import { getCookiesSettings, getRefreshCookieSettings } from "../../utils/Function";
import { blacklistToken } from "../../utils/tokenBlacklist";
import { VerificationService } from "./verification.service";

export class AuthServices {
  /**
   * @description  Login a user
   * @param email  - String
   * @param password - String
   * @returns  ResponseT
   */

  static executeLogin = async (
    email: string,
    password: string,
    stay: boolean,
    res: Response
  ): Promise<ResponseT> => {
    try {
      const user = await UserModel.findOne({ email });
      if (user) {
        // Check account status before password validation
        if (user.accountStatus === "locked") {
          authLogger.warn(`Login attempted on locked account: ${email}`);
          return new ErrorResponseC(
            "ACCOUNT_LOCKED",
            HttpCodes.Forbidden.code,
            "This account has been locked. Please contact support."
          );
        }

        if (user.accountStatus === "deleted") {
          authLogger.warn(`Login attempted on deleted account: ${email}`);
          return new ErrorResponseC(
            "LOGIN_ERROR",
            HttpCodes.Unauthorized.code,
            "Invalid email or password"
          );
        }

        const isPasswordMatch = await user.comparePasswords(password);
        if (isPasswordMatch) {
          const { accessToken, refreshToken } = GenerateTokenPair({
            _id: user._id.toString(),
            role: user.role
          });
          const resp: ICode<IAuthLogs> = authLogs.LOGIN_SUCCESS;
          const msg = formatString(resp.message, user.toObject());
          authLogger.info(msg, { type: resp.type });

          // Set access token cookie
          res.cookie("token", accessToken, getCookiesSettings(stay));
          // Set refresh token cookie
          res.cookie("refreshToken", refreshToken, getRefreshCookieSettings(stay));

          return new SuccessResponseC(
            resp.type,
            { ...user.Optimize(), accessToken, refreshToken, emailVerified: user.emailVerified },
            msg,
            HttpCodes.Accepted.code
          );

        }
        // Log the real reason internally
        authLogger.error(`Failed to login password incorrect ${email}.`);
      } else {
        // Log the real reason internally
        authLogger.error(`Failed to login email doesn't exist ${email}.`);
      }

      // Return generic message to prevent user enumeration
      return new ErrorResponseC(
        "LOGIN_ERROR",
        HttpCodes.Unauthorized.code,
        "Invalid email or password"
      );
    } catch (err) {
      const msg = formatString(authLogs.LOGIN_ERROR_GENERIC.message, {
        error: (err as Error)?.message || "",
        email,
      });
      authLogger.error(msg, err as Error);
      return new ErrorResponseC(
        authLogs.LOGIN_ERROR_GENERIC.type,
        HttpCodes.InternalServerError.code,
        msg
      );
    }
  };

  /**
   * @description Register a user
   * @param email  - String
   * @param password  - String
   * @param firstName  - String
   * @param lastName  - String
   * @returns {ResponseT}
   */

  static executeRegister = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    stay: boolean,
    res : Response
  ): Promise<ResponseT> => {
    try {
      const userExist = await UserModel.findOne({
        email,
      });
      if (userExist) {
        const msg = formatString(authLogs.REGISTER_ERROR_EMAIL_EXIST.message, {
          email,
        });
        authLogger.error(msg);
        return new ErrorResponseC(
          authLogs.REGISTER_ERROR_EMAIL_EXIST.type,
          HttpCodes.BadRequest.code,
          msg
        );
      }
      const user = new UserModel({ email, password, firstName, lastName });
      await user.save();

      // Send verification email (don't block registration if it fails)
      try {
        await VerificationService.createVerificationToken(user);
      } catch (error) {
        authLogger.error("Failed to send verification email during registration", error);
        // Continue with registration even if verification email fails
      }

      const { accessToken, refreshToken } = GenerateTokenPair({
        _id: user._id.toString(),
        role: user.role
      });

      // Set access token cookie
      res.cookie("token", accessToken, getCookiesSettings(stay));
      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, getRefreshCookieSettings(stay));

      const resp: ICode<IAuthLogs> = authLogs.REGISTER_SUCCESS;
      const msg = formatString(resp.message, user.toObject());
      authLogger.info(msg, { type: resp.type });
      return new SuccessResponseC(
        resp.type,
        { ...user.Optimize(), accessToken, refreshToken, emailVerified: user.emailVerified },
        msg,
        HttpCodes.Created.code
      );
    } catch (err) {
      const msg = formatString(authLogs.REGISTER_ERROR_GENERIC.message, {
        error: (err as Error)?.message || "",
        email,
      });
      authLogger.error(msg, err as Error);
      return new ErrorResponseC(
        authLogs.REGISTER_ERROR_GENERIC.type,
        HttpCodes.InternalServerError.code,
        msg
      );
    }
  };
  static executeAuthBack = async (user: UserD , stay : boolean , res : Response) => {
    try {
      // Check account status
      if (user.accountStatus === "locked") {
        authLogger.warn(`Auth back attempted on locked account: ${user.email}`);
        return new ErrorResponseC(
          "ACCOUNT_LOCKED",
          HttpCodes.Forbidden.code,
          "This account has been locked. Please contact support."
        );
      }

      if (user.accountStatus === "deleted") {
        authLogger.warn(`Auth back attempted on deleted account: ${user.email}`);
        return new ErrorResponseC(
          "ACCOUNT_DELETED",
          HttpCodes.Forbidden.code,
          "This account has been deleted"
        );
      }

      let msg = formatString(authLogs.AUTH_BACK.message, {
        email: user.email,
        username: user.firstName + " " + user.lastName,
      });
      authLogger.info(msg, { type: authLogs.AUTH_BACK.type });
      const { accessToken, refreshToken } = GenerateTokenPair({
        _id: user.id.toString(),
        role: user.role
      });

      // Set access token cookie
      res.cookie("token", accessToken, getCookiesSettings(stay));
      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, getRefreshCookieSettings(stay));

      return new SuccessResponseC(
        authLogs.AUTH_BACK.type,
        { ...user.Optimize(), accessToken, refreshToken, emailVerified: user.emailVerified },
        msg,
        HttpCodes.Accepted.code
      );
    } catch (err) {
      const msg = formatString(authLogs.AUTH_ERROR_GENERIC.message, {
        error: (err as Error)?.message || "",
        email: user.email,
      });
      authLogger.error(msg, err as Error);
      return new ErrorResponseC(
        authLogs.AUTH_ERROR_GENERIC.type,
        HttpCodes.InternalServerError.code,
        msg
      );
    }
  };

  /**
   * @description Refresh access token using refresh token
   * @param refreshToken - Refresh token string
   * @param stay - Remember user preference
   * @param res - Express response object
   * @returns ResponseT
   */
  static executeRefreshToken = async (
    refreshToken: string,
    stay: boolean,
    res: Response
  ): Promise<ResponseT> => {
    try {
      // Verify refresh token
      const payload = VerifyRefreshToken(refreshToken);

      // Find user to ensure they still exist
      const user = await UserModel.findById(payload._id);
      if (!user || !user.enable) {
        return new ErrorResponseC(
          "REFRESH_TOKEN_ERROR",
          HttpCodes.Unauthorized.code,
          "User not found or disabled"
        );
      }

      // Check account status
      if (user.accountStatus === "locked") {
        return new ErrorResponseC(
          "ACCOUNT_LOCKED",
          HttpCodes.Forbidden.code,
          "This account has been locked. Please contact support."
        );
      }

      if (user.accountStatus === "deleted") {
        return new ErrorResponseC(
          "ACCOUNT_DELETED",
          HttpCodes.Forbidden.code,
          "This account has been deleted"
        );
      }

      // Generate new token pair
      const tokens = GenerateTokenPair({
        _id: user._id.toString(),
        role: user.role
      });

      // Set new cookies
      res.cookie("token", tokens.accessToken, getCookiesSettings(stay));
      res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieSettings(stay));

      authLogger.info(`Token refreshed for user ${user.email}`);

      return new SuccessResponseC(
        "REFRESH_TOKEN_SUCCESS",
        { ...user.Optimize(), ...tokens },
        "Token refreshed successfully",
        HttpCodes.OK.code
      );
    } catch (err) {
      authLogger.error("Error refreshing token", err as Error);
      return new ErrorResponseC(
        "REFRESH_TOKEN_ERROR",
        HttpCodes.Unauthorized.code,
        (err as Error).message || "Invalid refresh token"
      );
    }
  };

  /**
   * @description Logout a user by blacklisting their tokens
   * @param accessToken - Access token to blacklist
   * @param refreshToken - Refresh token to blacklist
   * @param res - Express response object
   * @returns ResponseT
   */
  static executeLogout = async (
    accessToken: string | null,
    refreshToken: string | null,
    res: Response
  ): Promise<ResponseT> => {
    try {
      // Blacklist both access and refresh tokens
      if (accessToken) {
        await blacklistToken(accessToken);
      }
      if (refreshToken) {
        await blacklistToken(refreshToken);
      }

      // Clear cookies
      res.clearCookie("token");
      res.clearCookie("refreshToken");

      authLogger.info("User logged out successfully");

      return new SuccessResponseC(
        "LOGOUT_SUCCESS",
        null,
        "Logged out successfully",
        HttpCodes.OK.code
      );
    } catch (err) {
      authLogger.error("Error during logout", err as Error);
      return new ErrorResponseC(
        "LOGOUT_ERROR",
        HttpCodes.InternalServerError.code,
        "Error during logout"
      );
    }
  };
}
