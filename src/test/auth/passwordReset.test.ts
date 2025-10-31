import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes } from "@/config/Errors";
import { StopServer, app } from "@/app";
import { RandomEmail } from "@/utils/Function";
import { TEST_PASSWORD } from "@/utils/authUtilsTest";
import { UserModel, createUserFactory } from "@/db/models/user";
import { PasswordResetModel } from "@/db/models/passwordReset";
import crypto from "crypto";

afterAll(async () => {
	await StopServer();
});

describe("Password Reset - Forgot Password Endpoint", () => {
	test("Should send password reset email for existing user", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		const response = await request(app)
			.post("/auth/forgot-password")
			.send({ email });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("PASSWORD_RESET_EMAIL_SENT");

		// Check token was created in database
		const resetToken = await PasswordResetModel.findOne({ email });
		expect(resetToken).not.toBeNull();
		expect(resetToken?.token).toBeTruthy();
		expect(resetToken?.expiresAt).toBeInstanceOf(Date);
	});

	test("Should return generic success for non-existent email (security)", async () => {
		const response = await request(app)
			.post("/auth/forgot-password")
			.send({ email: RandomEmail() });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("PASSWORD_RESET_EMAIL_SENT");

		// Should not create token for non-existent user
		const token = await PasswordResetModel.findOne({ email: "nonexistent@test.com" });
		expect(token).toBeNull();
	});

	test("Should fail for locked account", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "locked"
		});

		const response = await request(app)
			.post("/auth/forgot-password")
			.send({ email });

		expect(response.status).toBe(HttpCodes.Forbidden.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("ACCOUNT_LOCKED");
	});

	test("Should return generic success for deleted account (security)", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "deleted"
		});

		const response = await request(app)
			.post("/auth/forgot-password")
			.send({ email });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
	});

	test("Should fail without email", async () => {
		const response = await request(app)
			.post("/auth/forgot-password")
			.send({});

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("error");
	});

	test("Should replace old reset token with new one", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Create first reset request
		const response1 = await request(app)
			.post("/auth/forgot-password")
			.send({ email });

		expect(response1.status).toBe(HttpCodes.OK.code);

		const firstTokenCount = await PasswordResetModel.countDocuments({ email });

		// Create second reset request
		const response2 = await request(app)
			.post("/auth/forgot-password")
			.send({ email });

		expect(response2.status).toBe(HttpCodes.OK.code);

		// Should still have only one token (old one replaced)
		const secondTokenCount = await PasswordResetModel.countDocuments({ email });
		expect(secondTokenCount).toBe(1);
	});
});

describe("Password Reset - Verify Reset Token Endpoint", () => {
	test("Should verify valid reset token", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Create reset token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

		await PasswordResetModel.create({
			email: user.email,
			token,
			user: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/verify-reset-token")
			.send({ token });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("TOKEN_VALID");
		expect(response.body.data).toHaveProperty("email", email);
	});

	test("Should fail with invalid token", async () => {
		const response = await request(app)
			.post("/auth/verify-reset-token")
			.send({ token: "invalid-token-123" });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("INVALID_TOKEN");
	});

	test("Should fail with expired token", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Create expired token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() - 1000); // Expired

		await PasswordResetModel.create({
			email: user.email,
			token,
			user: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/verify-reset-token")
			.send({ token });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("TOKEN_EXPIRED");

		// Token should be deleted
		const deletedToken = await PasswordResetModel.findOne({ token });
		expect(deletedToken).toBeNull();
	});

	test("Should fail without token", async () => {
		const response = await request(app)
			.post("/auth/verify-reset-token")
			.send({});

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("error");
	});
});

describe("Password Reset - Reset Password Endpoint", () => {
	test("Should successfully reset password with valid token", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Create reset token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

		await PasswordResetModel.create({
			email: user.email,
			token,
			user: user._id,
			expiresAt
		});

		const newPassword = "NewPass@1234";

		const response = await request(app)
			.post("/auth/reset-password")
			.send({ token, password: newPassword });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("PASSWORD_RESET_SUCCESS");
		expect(response.body.data).toHaveProperty("email", email);

		// Check token is deleted
		const deletedToken = await PasswordResetModel.findOne({ token });
		expect(deletedToken).toBeNull();

		// Test login with new password
		const loginResponse = await request(app)
			.post("/auth/login")
			.send({
				email,
				password: newPassword
			});

		expect(loginResponse.status).toBe(HttpCodes.Accepted.code);

		// Test old password doesn't work
		const oldPasswordResponse = await request(app)
			.post("/auth/login")
			.send({
				email,
				password: TEST_PASSWORD
			});

		expect(oldPasswordResponse.status).toBe(HttpCodes.Unauthorized.code);
	});

	test("Should fail with invalid token", async () => {
		const response = await request(app)
			.post("/auth/reset-password")
			.send({ token: "invalid-token", password: "NewPass@123" });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("INVALID_TOKEN");
	});

	test("Should fail with expired token", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Create expired token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() - 1000);

		await PasswordResetModel.create({
			email: user.email,
			token,
			user: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/reset-password")
			.send({ token, password: "NewPass@123" });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("TOKEN_EXPIRED");
	});

	test("Should fail for locked account", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "locked"
		});

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

		await PasswordResetModel.create({
			email: user.email,
			token,
			user: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/reset-password")
			.send({ token, password: "NewPass@123" });

		expect(response.status).toBe(HttpCodes.Forbidden.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("ACCOUNT_LOCKED");
	});

	test("Should fail for deleted account", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "deleted"
		});

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

		await PasswordResetModel.create({
			email: user.email,
			token,
			user: user._id,
			expiresAt
		});

		const response = await request(app)
			.post("/auth/reset-password")
			.send({ token, password: "NewPass@123" });

		expect(response.status).toBe(HttpCodes.Forbidden.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("ACCOUNT_DELETED");
	});

	test("Should fail without token or password", async () => {
		const response1 = await request(app)
			.post("/auth/reset-password")
			.send({ password: "NewPass@123" });

		expect(response1.status).toBe(400);

		const response2 = await request(app)
			.post("/auth/reset-password")
			.send({ token: "some-token" });

		expect(response2.status).toBe(400);
	});

	test("Should delete all reset tokens after successful reset", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Create multiple tokens (simulate multiple reset requests)
		const token1 = crypto.randomBytes(32).toString("hex");
		const token2 = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

		await PasswordResetModel.create({
			email: user.email,
			token: token1,
			user: user._id,
			expiresAt
		});

		await PasswordResetModel.create({
			email: user.email,
			token: token2,
			user: user._id,
			expiresAt
		});

		// Reset password with first token
		const response = await request(app)
			.post("/auth/reset-password")
			.send({ token: token1, password: "NewPass@123" });

		expect(response.status).toBe(HttpCodes.OK.code);

		// All tokens should be deleted
		const remainingTokens = await PasswordResetModel.find({ user: user._id });
		expect(remainingTokens.length).toBe(0);
	});
});
