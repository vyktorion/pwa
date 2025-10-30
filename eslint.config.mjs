import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "./lib/generated/**",
      "./src/public/sw.js",
      "./src/public/workbox-*.js",
      "./src/public/worker-*.js"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off" // Disable for PWA push notification setup
    }
  },
];

export default eslintConfig;
