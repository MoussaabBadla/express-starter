import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes } from "../../config/Errors";

import { StopServer, app } from "../../app";
import { authenticateUser } from "../../utils/authUtilsTest";
import { GenerateTokenPair } from "../../utils/jwt";
import { UserModel } from "../../db/models/user";

afterAll(async () => {
  await StopServer();
});

const route = "/auth/logout";

/**
 * @description  Test the logout route
 * @param {string} accessToken - The access token (Bearer token or in body)
 * @param {string} refreshToken - The refresh token (in body)
 * @route {POST} /auth/logout
 */

describe("Test logout with valid tokens", () => {
  test("It should successfully logout and blacklist tokens", async () => {
    // Create a test user
    const user = await UserModel.findOne({ role: "user" });
    if (!user) throw new Error("Test user not found");

    // Generate a valid token pair
    const tokens = GenerateTokenPair({
      _id: user._id.toString(),
      role: user.role,
    });

    const response = await request(app)
      .post(route)
      .set("authorization", `Bearer ${tokens.accessToken}`)
      .send({
        refreshToken: tokens.refreshToken,
      });

    expect(response.status).toBe(HttpCodes.OK.code);
    expect(response.body.status).toBe("LOGOUT_SUCCESS");
    expect(response.body.message).toBe("Logged out successfully");
    expect(response.body.data).toBeNull();

    // Verify tokens are blacklisted by trying to use them
    const authResponse = await request(app)
      .get("/auth/")
      .set("authorization", `Bearer ${tokens.accessToken}`);

    expect(authResponse.status).toBe(HttpCodes.Unauthorized.code);
    expect(authResponse.body.message).toContain("Token has been revoked");
  });
});

describe("Test logout with only access token", () => {
  test("It should successfully logout", async () => {
    const accessToken = await authenticateUser();

    const response = await request(app)
      .post(route)
      .set("authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(HttpCodes.OK.code);
    expect(response.body.status).toBe("LOGOUT_SUCCESS");
    expect(response.body.message).toBe("Logged out successfully");
  });
});

describe("Test logout with only refresh token", () => {
  test("It should successfully logout", async () => {
    // Create a test user
    const user = await UserModel.findOne({ role: "user" });
    if (!user) throw new Error("Test user not found");

    // Generate a valid token pair
    const tokens = GenerateTokenPair({
      _id: user._id.toString(),
      role: user.role,
    });

    const response = await request(app).post(route).send({
      refreshToken: tokens.refreshToken,
    });

    expect(response.status).toBe(HttpCodes.OK.code);
    expect(response.body.status).toBe("LOGOUT_SUCCESS");
    expect(response.body.message).toBe("Logged out successfully");
  });
});

describe("Test logout without any tokens", () => {
  test("It should still return success (no tokens to blacklist)", async () => {
    const response = await request(app).post(route).send({});

    expect(response.status).toBe(HttpCodes.OK.code);
    expect(response.body.status).toBe("LOGOUT_SUCCESS");
    expect(response.body.message).toBe("Logged out successfully");
  });
});
