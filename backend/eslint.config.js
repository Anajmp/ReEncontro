import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/", "coverage/"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // `_` como prefixo indica parâmetro/variável propositalmente ignorado
      // (ex.: `next` em middlewares de erro do Express).
      // TEMPORÁRIO: regras com pendências que exigem decisão (ver PR do lint).
      // Ficam como aviso para não quebrar o CI; voltar para "error" quando zeradas.
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "no-unused-private-class-members": "warn",
    },
  },
  {
    files: ["**/*.test.js", "**/__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
];
