import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [

  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "dataconnect-generated/**",
      "app/server/**",
    ],
  },

  // Frontend (React) code
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" }, 
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Recommended baselines
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,

      // Quality-of-life / practicality
      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",

      // Hooks
      "react-hooks/exhaustive-deps": "warn",

      // Vite HMR rule
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Unused vars: warn + allow _prefix to intentionally ignore
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Optional: keep console logs from creeping into production
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Global Node/server lint
  
  {
    files: ["btt-socket-server/**/*.{js,jsx,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
    },
  },
  
];
