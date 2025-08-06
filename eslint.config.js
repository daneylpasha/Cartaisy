// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // Prevent inline styles
      "react/no-inline-styles": "error",
      // Prevent inline styles in JSX
      "react/style-prop-object": "error",
      // Additional React best practices
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-key": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
]);
