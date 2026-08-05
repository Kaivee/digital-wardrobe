import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Items carry user-supplied image URLs, so the Next.js Image optimizer
      // (remote patterns) doesn't fit; plain <img> is intentional here.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
