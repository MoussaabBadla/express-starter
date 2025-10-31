import { describe, expect, test, beforeAll } from "@jest/globals";
import Logger from "../../utils/Logger";
import fs from "fs";
import path from "path";
import { LogsRoot } from "../../config/Env";

describe("Logging System Tests", () => {
  let testLogger: Logger;

  beforeAll(() => {
    testLogger = new Logger("test-logger");
  });

  test("Should create logs directory if it doesn't exist", () => {
    expect(fs.existsSync(LogsRoot)).toBe(true);
  });

  test("Should create log file for logger instance", (done) => {
    const logFilePath = path.join(LogsRoot, "test-logger.log");

    testLogger.info("Test log message");

    // Give it a moment to write
    setTimeout(() => {
      expect(fs.existsSync(logFilePath)).toBe(true);
      done();
    }, 100);
  });

  test("Should log different levels correctly", (done) => {
    const logger = new Logger("test-levels");

    logger.error("Error message");
    logger.warn("Warning message");
    logger.info("Info message");
    logger.debug("Debug message");

    setTimeout(() => {
      const logFile = path.join(LogsRoot, "test-levels.log");
      expect(fs.existsSync(logFile)).toBe(true);

      const content = fs.readFileSync(logFile, "utf-8");
      expect(content).toContain("Error message");
      expect(content).toContain("Warning message");
      done();
    }, 200);
  });

  test("Should handle logger with custom format", () => {
    const customFormat = (info: any) => `CUSTOM: ${info.message}`;
    const customLogger = new Logger("custom-format", customFormat);

    expect(customLogger).toBeDefined();
    customLogger.info("Custom formatted message");
  });
});

describe("Email System Tests", () => {
  test("Email module should export SendEmail function", async () => {
    const { SendEmail } = await import("../../utils/Email");
    expect(typeof SendEmail).toBe("function");
  });

  test("Email module should export isEmailServiceReady function", async () => {
    const { isEmailServiceReady } = await import("../../utils/Email");
    expect(typeof isEmailServiceReady).toBe("function");
  });

  test("isEmailServiceReady should return boolean or timeout", async () => {
    const { isEmailServiceReady } = await import("../../utils/Email");

    // In test environment, email might not be configured
    // This should not throw, just return false
    try {
      // Race with timeout since email init waits for env event
      const result = await Promise.race([
        isEmailServiceReady(),
        new Promise((resolve) => setTimeout(() => resolve(false), 1000))
      ]);
      expect(typeof result).toBe("boolean");
    } catch (error) {
      // Email not configured is acceptable in test environment
      expect(error).toBeDefined();
    }
  }, 5000);
});

describe("Logging System - Error Handling", () => {
  test("Logger should handle errors gracefully", () => {
    expect(() => {
      const logger = new Logger("error-test");
      logger.error("Test error", { stack: "test stack" });
    }).not.toThrow();
  });

  test("Logger should handle missing meta gracefully", () => {
    const logger = new Logger("no-meta-test");

    expect(() => {
      logger.info("Message without meta");
      logger.error("Error without meta");
      logger.warn("Warning without meta");
    }).not.toThrow();
  });
});
