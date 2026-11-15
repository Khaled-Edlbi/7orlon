import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma writes TypeScript source here; it is generated, not authored.
    "src/generated/**",
    // The Claude Design handoff bundle — read-only reference prototypes.
    "design-reference/**",
  ]),
]);

export default eslintConfig;
