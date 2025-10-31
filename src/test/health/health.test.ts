import { describe, expect, test } from "@jest/globals";
import request from "supertest";

import { StopServer, app } from "../../app";

afterAll(async () => {
  await StopServer();
});

/**
 * @description Test the health check endpoints
 * These endpoints are used by Kubernetes/Docker for monitoring
 */

describe("Test /health/ - Main health check endpoint", () => {
  test("It should return 200 with healthy status when services are up", async () => {
    const response = await request(app).get("/health/");

    // Should return 200 when healthy
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("checks");
    expect(response.body.checks).toHaveProperty("mongodb");
    expect(response.body.checks).toHaveProperty("redis");

    // If services are up, status should be OK
    if (response.status === 200) {
      expect(response.body.status).toBe("OK");
      expect(response.body.checks.mongodb).toBe("UP");
      expect(response.body.checks.redis).toBe("UP");
    } else {
      // If any service is down, status should be DEGRADED
      expect(response.body.status).toMatch(/DEGRADED|ERROR/);
    }
  });

  test("It should return valid uptime", async () => {
    const response = await request(app).get("/health/");

    expect(typeof response.body.uptime).toBe("number");
    expect(response.body.uptime).toBeGreaterThan(0);
  });

  test("It should return valid timestamp", async () => {
    const response = await request(app).get("/health/");

    expect(typeof response.body.timestamp).toBe("number");
    expect(response.body.timestamp).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
    expect(response.body.timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe("Test /health/ready - Readiness check endpoint", () => {
  test("It should return readiness status", async () => {
    const response = await request(app).get("/health/ready");

    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("status");

    if (response.status === 200) {
      expect(response.body.status).toBe("ready");
    } else {
      expect(response.body.status).toBe("not ready");
    }
  });
});

describe("Test /health/live - Liveness check endpoint", () => {
  test("It should always return 200 with alive status", async () => {
    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("alive");
  });

  test("It should respond quickly (sanity check)", async () => {
    const startTime = Date.now();
    await request(app).get("/health/live");
    const duration = Date.now() - startTime;

    // Liveness check should be very fast (under 100ms)
    expect(duration).toBeLessThan(100);
  });
});

describe("Test health endpoint consistency", () => {
  test("Multiple consecutive calls should return consistent results", async () => {
    const response1 = await request(app).get("/health/");
    const response2 = await request(app).get("/health/");

    // Status codes should be consistent
    expect(response1.status).toBe(response2.status);

    // Service statuses should be consistent
    expect(response1.body.checks.mongodb).toBe(response2.body.checks.mongodb);
    expect(response1.body.checks.redis).toBe(response2.body.checks.redis);
  });
});
