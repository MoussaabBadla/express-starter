import Logger from "../../utils/Logger";

export type IPasswordResetLogs =
  | "PASSWORD_RESET_EMAIL_SENT"
  | "PASSWORD_RESET_EMAIL_SENT_ERROR"
  | "PASSWORD_RESET_SUCCESS"
  | "PASSWORD_RESET_TOKEN_INVALID"
  | "PASSWORD_RESET_TOKEN_EXPIRED"
  | "PASSWORD_RESET_TOKEN_CREATED"
  | "PASSWORD_RESET_ACCOUNT_LOCKED"
  | "PASSWORD_RESET_ACCOUNT_DELETED"
  | "PASSWORD_RESET_ERROR_GENERIC"
  | "PASSWORD_RESET_REQUEST_NON_EXISTENT"
  | "USER_NOT_FOUND_FOR_RESET";

export const passwordResetLogs: IErrors<IPasswordResetLogs> = {
  PASSWORD_RESET_EMAIL_SENT: {
    code: 200,
    message: "Password reset email sent to {email}",
    type: "PASSWORD_RESET_EMAIL_SENT",
  },
  PASSWORD_RESET_EMAIL_SENT_ERROR: {
    code: 201,
    message: "Failed to send password reset email to {email}: {error}",
    type: "PASSWORD_RESET_EMAIL_SENT_ERROR",
  },
  PASSWORD_RESET_SUCCESS: {
    code: 202,
    message: "Password reset successfully for {email}",
    type: "PASSWORD_RESET_SUCCESS",
  },
  PASSWORD_RESET_TOKEN_INVALID: {
    code: 203,
    message: "Invalid password reset token attempted: {token}",
    type: "PASSWORD_RESET_TOKEN_INVALID",
  },
  PASSWORD_RESET_TOKEN_EXPIRED: {
    code: 204,
    message: "Expired password reset token attempted: {token}",
    type: "PASSWORD_RESET_TOKEN_EXPIRED",
  },
  PASSWORD_RESET_TOKEN_CREATED: {
    code: 205,
    message: "Password reset token created for user {email}",
    type: "PASSWORD_RESET_TOKEN_CREATED",
  },
  PASSWORD_RESET_ACCOUNT_LOCKED: {
    code: 206,
    message: "Password reset attempted for locked account: {email}",
    type: "PASSWORD_RESET_ACCOUNT_LOCKED",
  },
  PASSWORD_RESET_ACCOUNT_DELETED: {
    code: 207,
    message: "Password reset attempted for deleted account: {email}",
    type: "PASSWORD_RESET_ACCOUNT_DELETED",
  },
  PASSWORD_RESET_ERROR_GENERIC: {
    code: 208,
    message: "Error occurred during password reset for {email}: {error}",
    type: "PASSWORD_RESET_ERROR_GENERIC",
  },
  PASSWORD_RESET_REQUEST_NON_EXISTENT: {
    code: 209,
    message: "Password reset requested for non-existent email: {email}",
    type: "PASSWORD_RESET_REQUEST_NON_EXISTENT",
  },
  USER_NOT_FOUND_FOR_RESET: {
    code: 210,
    message: "User not found for password reset token: {userId}",
    type: "USER_NOT_FOUND_FOR_RESET",
  },
} as const;

export default passwordResetLogs;
export const passwordResetLogger = new Logger("password-reset");
