import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { HttpCodes } from "../../config/Errors";

import { StopServer, app } from "../../app";
import { RandomString } from "../../utils/Function";
import { authenticateUser } from "../../utils/authUtilsTest";
import { GenerateTokenPair } from "../../utils/jwt";
import { UserModel } from "../../db/models/user";

afterAll(async () => {
  await StopServer();
});

const route = "/auth/refresh";

/**
 * @description  Test the refresh token route
 * @param {string} refreshToken - The refresh token
 * @route {POST} /auth/refresh
 */

describe("Test refresh token with valid refresh token", () => {
  test("It should return new access and refresh tokens", async () => {
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
    expect(response.body.status).toBe("REFRESH_TOKEN_SUCCESS");
    expect(response.body.message).toBe("Token refreshed successfully");
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
    expect(response.body.data).toHaveProperty("email");
  });
});

describe("Test refresh token without providing refresh token", () => {
  test("It should return 401 error", async () => {
    const response = await request(app).post(route).send({});

    expect(response.status).toBe(HttpCodes.Unauthorized.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Refresh token is required");
  });
});

describe("Test refresh token with invalid refresh token", () => {
  test("It should return 401 error", async () => {
    const response = await request(app).post(route).send({
      refreshToken: "Bearer " + RandomString(),
    });

    expect(response.status).toBe(HttpCodes.Unauthorized.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("REFRESH_TOKEN_ERROR");
  });
});

describe("Test refresh token with access token instead of refresh token", () => {
  test("It should return error about invalid token type", async () => {
    // Generate token pair and try to use access token
    const accessToken = await authenticateUser();

    const response = await request(app).post(route).send({
      refreshToken: accessToken,
    });

    expect(response.status).toBe(HttpCodes.Unauthorized.code);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("REFRESH_TOKEN_ERROR");
    expect(response.body.error).toContain("Invalid token type");
  });
});
