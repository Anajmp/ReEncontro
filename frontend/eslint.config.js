import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  {
    // TEMPORÁRIO: arquivos com alterações em andamento na feature de
    // verificação de e-mail. Ficam como aviso até essa branch ser integrada;
    // depois corrigir os avisos e remover este bloco.
    files: [
      "src/lib/api.ts",
      "src/contexts/AuthContext.tsx",
      "src/app/components/PublicListing.tsx",
      "src/app/components/ParentProfile.tsx",
      "src/app/components/Register.tsx",
      "src/app/components/shared/AuthChrome.tsx",
      "src/app/components/shared/SiteHeader.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Componentes gerados pelo shadcn/ui exportam variantes (ex.: buttonVariants)
    // junto com o componente, por convenção da biblioteca.
    files: ["src/app/components/ui/**"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Arquivos de configuração rodam no Node, não no navegador.
    files: ["vite.config.ts", "*.config.{js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
