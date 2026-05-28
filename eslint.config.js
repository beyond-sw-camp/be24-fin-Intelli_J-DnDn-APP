import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        CustomEvent: "readonly",
        URL: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      "vue/no-deprecated-slot-attribute": "off",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
    },
  },
  {
    files: ["src/**/*.js", "vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        CustomEvent: "readonly",
        import: "readonly",
        URL: "readonly",
        fetch: "readonly",
      },
    },
  },
  {
    files: [
      "scripts/**/*.js",
      "scripts/**/*.mjs",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        atob: "readonly",
        Blob: "readonly",
        Buffer: "readonly",
        console: "readonly",
        crypto: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        TextEncoder: "readonly",
        URL: "readonly",
      },
    },
  },
];
