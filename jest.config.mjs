import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ["<rootDir>/src/__test__/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  runner: "groups",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  // Testcontainers sometimes take some time to initialize.
  // Allow for some extra time to prevent timing out tests prematurely
  testTimeout: 30_000,
};

export default createJestConfig(config);
