import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.vercel/**",
      "packages/api/generated/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Aturan bersama untuk seluruh TypeScript.
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // "Zero any policy" dari README lama akhirnya benar-benar ditegakkan.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "log"] }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },

  // Web: React + browser.
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // API, entrypoint Vercel, dan konfigurasi: Node.
  {
    files: [
      "api/**/*.ts",
      "packages/api/**/*.ts",
      "packages/shared/**/*.ts",
      "*.config.{ts,js}",
      "**/*.config.{ts,js}",
    ],
    languageOptions: { globals: globals.node },
  },

  // Service worker.
  {
    files: ["apps/web/public/sw.js"],
    languageOptions: {
      globals: { ...globals.serviceworker, ...globals.browser },
    },
  },

  prettier,
);
