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
};

export default createJestConfig(config);
