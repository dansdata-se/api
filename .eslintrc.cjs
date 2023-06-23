module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
        "next/core-web-vitals",
        "prettier",
      ],
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  ],
  rules: {
    eqeqeq: "error",
    "no-restricted-imports": [
      "error",
      {
        patterns: [{ group: ["/.*"], message: "Use `@/` for local imports." }],
        paths: [
          {
            name: "zod",
            importNames: ["default", "z"],
            message:
              'Use `import z from "@/api/zod"` instead for consistent extensions.',
          },
        ],
      },
    ],
  },
};
