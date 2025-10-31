import Logger from "../../utils/Logger";

export type IAccountManagementLogs =
  | "ACCOUNT_DELETED_SUCCESS"
  | "ACCOUNT_DELETION_EMAIL_SENT"
  | "ACCOUNT_DELETION_EMAIL_ERROR"
  | "ACCOUNT_ALREADY_DELETED"
  | "ACCOUNT_LOCKED_SUCCESS"
  | "ACCOUNT_LOCKED_EMAIL_SENT"
  | "ACCOUNT_LOCKED_EMAIL_ERROR"
  | "ACCOUNT_ALREADY_LOCKED"
  | "ACCOUNT_UNLOCKED_SUCCESS"
  | "ACCOUNT_NOT_LOCKED"
  | "ACCOUNT_MANAGEMENT_ERROR_GENERIC"
  | "USER_NOT_FOUND_FOR_ACCOUNT_ACTION"
  | "CANNOT_LOCK_DELETED_ACCOUNT";

export const accountManagementLogs: IErrors<IAccountManagementLogs> = {
  ACCOUNT_DELETED_SUCCESS: {
    code: 300,
    message: "Account deleted successfully for user {email}",
    type: "ACCOUNT_DELETED_SUCCESS",
  },
  ACCOUNT_DELETION_EMAIL_SENT: {
    code: 301,
    message: "Account deletion email sent to {email}",
    type: "ACCOUNT_DELETION_EMAIL_SENT",
  },
  ACCOUNT_DELETION_EMAIL_ERROR: {
    code: 302,
    message: "Failed to send account deletion email to {email}: {error}",
    type: "ACCOUNT_DELETION_EMAIL_ERROR",
  },
  ACCOUNT_ALREADY_DELETED: {
    code: 303,
    message: "Account is already deleted for user {email}",
    type: "ACCOUNT_ALREADY_DELETED",
  },
  ACCOUNT_LOCKED_SUCCESS: {
    code: 304,
    message: "Account locked successfully for user {email}. Reason: {reason}",
    type: "ACCOUNT_LOCKED_SUCCESS",
  },
  ACCOUNT_LOCKED_EMAIL_SENT: {
    code: 305,
    message: "Account locked email sent to {email}",
    type: "ACCOUNT_LOCKED_EMAIL_SENT",
  },
  ACCOUNT_LOCKED_EMAIL_ERROR: {
    code: 306,
    message: "Failed to send account locked email to {email}: {error}",
    type: "ACCOUNT_LOCKED_EMAIL_ERROR",
  },
  ACCOUNT_ALREADY_LOCKED: {
    code: 307,
    message: "Account is already locked for user {email}",
    type: "ACCOUNT_ALREADY_LOCKED",
  },
  ACCOUNT_UNLOCKED_SUCCESS: {
    code: 308,
    message: "Account unlocked successfully for user {email}",
    type: "ACCOUNT_UNLOCKED_SUCCESS",
  },
  ACCOUNT_NOT_LOCKED: {
    code: 309,
    message: "Account is not locked for user {email}",
    type: "ACCOUNT_NOT_LOCKED",
  },
  ACCOUNT_MANAGEMENT_ERROR_GENERIC: {
    code: 310,
    message: "Error occurred during account management for {email}: {error}",
    type: "ACCOUNT_MANAGEMENT_ERROR_GENERIC",
  },
  USER_NOT_FOUND_FOR_ACCOUNT_ACTION: {
    code: 311,
    message: "User not found for account action: {userId}",
    type: "USER_NOT_FOUND_FOR_ACCOUNT_ACTION",
  },
  CANNOT_LOCK_DELETED_ACCOUNT: {
    code: 312,
    message: "Cannot lock a deleted account: {email}",
    type: "CANNOT_LOCK_DELETED_ACCOUNT",
  },
} as const;

export default accountManagementLogs;
export const accountManagementLogger = new Logger("account-management");
