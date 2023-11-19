module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@typescript-eslint/strict",
    "next/core-web-vitals",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  root: true,
  reportUnusedDisableDirectives: true,
  rules: {
    eqeqeq: "error",
    "no-restricted-imports": [
      "error",
      {
        patterns: [{ group: ["/.*"], message: "Use `@/` for local imports." }],
        paths: [
          {
            name: "process",
            importNames: ["env"],
            message:
              'Use `import env from "@/env"` to access environment variables.',
          },
          {
            name: "zod",
            importNames: ["default", "z"],
            message:
              'Use `import z from "@/api/zod"` instead for consistent extensions.',
          },
          {
            name: "dayjs",
            importNames: ["default"],
            message:
              'Use `import dayjs from "@/dayjs"` instead for consistent extensions.',
          },
        ],
      },
    ],
    "@typescript-eslint/no-invalid-void-type": [
      "error",
      { allowAsThisParameter: true },
    ],
  },
};
