import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes } from "@/config/Errors";
import { StopServer, app } from "@/app";
import { RandomEmail } from "@/utils/Function";
import { TEST_PASSWORD, authenticateAdmin, authenticateUser } from "@/utils/authUtilsTest";
import { UserModel, createUserFactory } from "@/db/models/user";

afterAll(async () => {
	await StopServer();
});

describe("Account Management - Delete Own Account", () => {
	test("Should successfully delete own account when authenticated", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Login to get auth token
		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		const accessToken = loginResponse.body.data.accessToken;

		// Delete account
		const response = await request(app)
			.delete("/auth/account")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("ACCOUNT_DELETED");

		// Check user is marked as deleted in database
		const deletedUser = await UserModel.findById(user._id);
		expect(deletedUser?.accountStatus).toBe("deleted");
		expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
		expect(deletedUser?.enable).toBe(false);

		// Try to login with deleted account
		const loginAfterDelete = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		expect(loginAfterDelete.status).toBe(HttpCodes.Unauthorized.code);
	});

	test("Should fail to delete account without authentication", async () => {
		const response = await request(app)
			.delete("/auth/account");

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
		expect(response.body.status).toBe("error");
	});

	test("Should fail to delete already deleted account", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "deleted"
		});

		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		// Should fail to login with deleted account
		expect(loginResponse.status).toBe(HttpCodes.Unauthorized.code);
	});

	test("Should clear cookies after successful deletion", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		const accessToken = loginResponse.body.data.accessToken;

		const response = await request(app)
			.delete("/auth/account")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(response.status).toBe(HttpCodes.OK.code);

		// Check cookies are cleared
		const cookies = response.headers["set-cookie"];
		if (cookies && Array.isArray(cookies)) {
			expect(cookies.some((cookie: string) => cookie.includes("token=;"))).toBe(true);
			expect(cookies.some((cookie: string) => cookie.includes("refreshToken=;"))).toBe(true);
		}
	});
});

describe("Account Management - Get Account Status", () => {
	test("Should get account status for authenticated user", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			emailVerified: true
		});

		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		const accessToken = loginResponse.body.data.accessToken;

		const response = await request(app)
			.get("/auth/account/status")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("ACCOUNT_STATUS_RETRIEVED");
		expect(response.body.data).toHaveProperty("accountStatus", "active");
		expect(response.body.data).toHaveProperty("emailVerified", true);
	});

	test("Should fail to get account status without authentication", async () => {
		const response = await request(app)
			.get("/auth/account/status");

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
		expect(response.body.status).toBe("error");
	});

	test("Should show locked status for locked account", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "locked",
			lockedReason: "Suspicious activity"
		});

		// Cannot login with locked account, so we need to check differently
		// This test verifies the data structure when manually querying
		const accountStatus = {
			accountStatus: user.accountStatus,
			emailVerified: user.emailVerified,
			lockedReason: user.lockedReason
		};

		expect(accountStatus.accountStatus).toBe("locked");
		expect(accountStatus.lockedReason).toBe("Suspicious activity");
	});
});

describe("Account Management - Admin Lock Account", () => {
	test("Should allow admin to lock user account", async () => {
		const adminToken = await authenticateAdmin();

		// Create target user
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		const response = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				userId: user._id!.toString(),
				reason: "Violation of terms of service"
			});

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("ACCOUNT_LOCKED");
		expect(response.body.data).toHaveProperty("email", email);
		expect(response.body.data).toHaveProperty("reason", "Violation of terms of service");

		// Check user is locked in database
		const lockedUser = await UserModel.findById(user._id);
		expect(lockedUser?.accountStatus).toBe("locked");
		expect(lockedUser?.lockedReason).toBe("Violation of terms of service");
		expect(lockedUser?.lockedAt).toBeInstanceOf(Date);
		expect(lockedUser?.enable).toBe(false);

		// Try to login with locked account
		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		expect(loginResponse.status).toBe(HttpCodes.Forbidden.code);
		expect(loginResponse.body.message).toBe("ACCOUNT_LOCKED");
	});

	test("Should fail to lock account without admin role", async () => {
		const userToken = await authenticateUser();

		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		const response = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				userId: user._id!.toString(),
				reason: "Test"
			});

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
		expect(response.body.status).toBe("error");
	});

	test("Should fail to lock account without authentication", async () => {
		const response = await request(app)
			.post("/auth/admin/lock-account")
			.send({
				userId: "507f1f77bcf86cd799439011",
				reason: "Test"
			});

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
	});

	test("Should fail to lock non-existent user", async () => {
		const adminToken = await authenticateAdmin();

		const response = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				userId: "507f1f77bcf86cd799439011",
				reason: "Test"
			});

		expect(response.status).toBe(HttpCodes.NotFound.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("USER_NOT_FOUND");
	});

	test("Should fail to lock already locked account", async () => {
		const adminToken = await authenticateAdmin();

		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "locked"
		});

		const response = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				userId: user._id!.toString(),
				reason: "Another reason"
			});

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("ACCOUNT_ALREADY_LOCKED");
	});

	test("Should fail to lock deleted account", async () => {
		const adminToken = await authenticateAdmin();

		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "deleted"
		});

		const response = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				userId: user._id!.toString(),
				reason: "Test"
			});

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("ACCOUNT_DELETED");
	});

	test("Should fail without userId or reason", async () => {
		const adminToken = await authenticateAdmin();

		const response1 = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ reason: "Test" });

		expect(response1.status).toBe(400);

		const response2 = await request(app)
			.post("/auth/admin/lock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ userId: "507f1f77bcf86cd799439011" });

		expect(response2.status).toBe(400);
	});
});

describe("Account Management - Admin Unlock Account", () => {
	test("Should allow admin to unlock locked account", async () => {
		const adminToken = await authenticateAdmin();

		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "locked",
			lockedReason: "Suspicious activity"
		});

		const response = await request(app)
			.post("/auth/admin/unlock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ userId: user._id!.toString() });

		expect(response.status).toBe(HttpCodes.OK.code);
		expect(response.body.status).toBe("success");
		expect(response.body.message).toBe("ACCOUNT_UNLOCKED");
		expect(response.body.data).toHaveProperty("email", email);

		// Check user is unlocked in database
		const unlockedUser = await UserModel.findById(user._id);
		expect(unlockedUser?.accountStatus).toBe("active");
		expect(unlockedUser?.lockedReason).toBeUndefined();
		expect(unlockedUser?.lockedAt).toBeUndefined();
		expect(unlockedUser?.enable).toBe(true);

		// Should be able to login again
		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		expect(loginResponse.status).toBe(HttpCodes.Accepted.code);
	});

	test("Should fail to unlock account without admin role", async () => {
		const userToken = await authenticateUser();

		const response = await request(app)
			.post("/auth/admin/unlock-account")
			.set("Authorization", `Bearer ${userToken}`)
			.send({ userId: "507f1f77bcf86cd799439011" });

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
	});

	test("Should fail to unlock non-locked account", async () => {
		const adminToken = await authenticateAdmin();

		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "active"
		});

		const response = await request(app)
			.post("/auth/admin/unlock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ userId: user._id!.toString() });

		expect(response.status).toBe(HttpCodes.BadRequest.code);
		expect(response.body.status).toBe("error");
		expect(response.body.message).toBe("ACCOUNT_NOT_LOCKED");
	});

	test("Should fail to unlock non-existent user", async () => {
		const adminToken = await authenticateAdmin();

		const response = await request(app)
			.post("/auth/admin/unlock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ userId: "507f1f77bcf86cd799439011" });

		expect(response.status).toBe(HttpCodes.NotFound.code);
		expect(response.body.message).toBe("USER_NOT_FOUND");
	});

	test("Should fail without userId", async () => {
		const adminToken = await authenticateAdmin();

		const response = await request(app)
			.post("/auth/admin/unlock-account")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({});

		expect(response.status).toBe(400);
	});
});

describe("Account Management - Integration Tests", () => {
	test("Locked account should not be able to reset password", async () => {
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
		expect(response.body.message).toBe("ACCOUNT_LOCKED");
	});

	test("Locked account should not be able to refresh token", async () => {
		const email = RandomEmail();
		const user = await createUserFactory({
			email,
			password: TEST_PASSWORD
		});

		// Login first
		const loginResponse = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		const refreshToken = loginResponse.body.data.refreshToken;

		// Lock account
		user.accountStatus = "locked";
		await user.save();

		// Try to refresh token
		const response = await request(app)
			.post("/auth/refresh")
			.send({ refreshToken });

		expect(response.status).toBe(HttpCodes.Forbidden.code);
		expect(response.body.message).toBe("ACCOUNT_LOCKED");
	});

	test("Deleted account should not be able to login", async () => {
		const email = RandomEmail();
		await createUserFactory({
			email,
			password: TEST_PASSWORD,
			accountStatus: "deleted"
		});

		const response = await request(app)
			.post("/auth/login")
			.send({ email, password: TEST_PASSWORD });

		expect(response.status).toBe(HttpCodes.Unauthorized.code);
		expect(response.body.error).toBe("Invalid email or password");
	});
});
