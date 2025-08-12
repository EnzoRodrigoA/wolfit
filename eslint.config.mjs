import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import jest from "eslint-plugin-jest";

const jestGlobals = Object.fromEntries(
  Object.entries(jest.environments.globals.globals).map(([key]) => [key, true]),
);

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, jest },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...jestGlobals,
      },
    },
    ignores: ["node_modules"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
    },
  },
]);
