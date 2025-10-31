import Logger from "../../utils/Logger";

export type IVerificationLogs =
  | "VERIFICATION_EMAIL_SENT"
  | "VERIFICATION_EMAIL_SENT_ERROR"
  | "EMAIL_VERIFIED_SUCCESS"
  | "EMAIL_ALREADY_VERIFIED"
  | "VERIFICATION_TOKEN_INVALID"
  | "VERIFICATION_TOKEN_EXPIRED"
  | "VERIFICATION_TOKEN_CREATED"
  | "VERIFICATION_RESEND_SUCCESS"
  | "VERIFICATION_ERROR_GENERIC"
  | "USER_NOT_FOUND_FOR_VERIFICATION";

export const verificationLogs: IErrors<IVerificationLogs> = {
  VERIFICATION_EMAIL_SENT: {
    code: 100,
    message: "Verification email sent successfully to {email}",
    type: "VERIFICATION_EMAIL_SENT",
  },
  VERIFICATION_EMAIL_SENT_ERROR: {
    code: 101,
    message: "Failed to send verification email to {email}: {error}",
    type: "VERIFICATION_EMAIL_SENT_ERROR",
  },
  EMAIL_VERIFIED_SUCCESS: {
    code: 102,
    message: "Email verified successfully for {email}",
    type: "EMAIL_VERIFIED_SUCCESS",
  },
  EMAIL_ALREADY_VERIFIED: {
    code: 103,
    message: "Email is already verified for {email}",
    type: "EMAIL_ALREADY_VERIFIED",
  },
  VERIFICATION_TOKEN_INVALID: {
    code: 104,
    message: "Invalid verification token attempted: {token}",
    type: "VERIFICATION_TOKEN_INVALID",
  },
  VERIFICATION_TOKEN_EXPIRED: {
    code: 105,
    message: "Expired verification token attempted: {token}",
    type: "VERIFICATION_TOKEN_EXPIRED",
  },
  VERIFICATION_TOKEN_CREATED: {
    code: 106,
    message: "Verification token created for user {email}",
    type: "VERIFICATION_TOKEN_CREATED",
  },
  VERIFICATION_RESEND_SUCCESS: {
    code: 107,
    message: "Verification email resent to {email}",
    type: "VERIFICATION_RESEND_SUCCESS",
  },
  VERIFICATION_ERROR_GENERIC: {
    code: 108,
    message: "Error occurred during verification for {email}: {error}",
    type: "VERIFICATION_ERROR_GENERIC",
  },
  USER_NOT_FOUND_FOR_VERIFICATION: {
    code: 109,
    message: "User not found for verification token: {userId}",
    type: "USER_NOT_FOUND_FOR_VERIFICATION",
  },
} as const;

export default verificationLogs;
export const verificationLogger = new Logger("verification");
