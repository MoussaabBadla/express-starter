/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
  
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
      "^@App/(.*)$": "./src/$1",
      "^@Test/(.*)$": "./src/test/$1",
    },
    testTimeout: 30000,
  
    testMatch: ["**/test/**/**.test.ts"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  };
  