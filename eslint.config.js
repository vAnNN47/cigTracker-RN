// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // `any` is build-blocked — use real types or `unknown` + narrowing.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);
