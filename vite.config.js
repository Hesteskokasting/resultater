import { defineConfig, lazyPlugins } from "vite-plus";
import { resolve } from "path";
import pkg from "./package.json";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["src/types/database.types.ts"],
  },
  lint: {
    ignorePatterns: ["supabase/functions/**", "src/types/database.types.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      // A bare callback reference gets the array index as its second argument;
      // that silently became a score total once (see toConfirmSide).
      "unicorn/no-array-callback-reference": "error",
    },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["../tests/**/*.test.ts"],
    // Tests must not depend on .env or CI secrets; src/supabase.ts throws without a URL.
    env: {
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
  root: "src",
  css: {
    // Source maps in dev so DevTools points at src/css/**, not the flattened styles.css.
    devSourcemap: true,
  },
  envDir: "..",
  plugins: lazyPlugins(() => [
    {
      name: "inject-app-version",
      transformIndexHtml(html) {
        return html.replace("%APP_VERSION%", pkg.version);
      },
    },
  ]),
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { test: /node_modules\/xlsx/, name: "xlsx" },
            { test: /node_modules\/chart\.js/, name: "charts" },
            { test: /node_modules\/@supabase/, name: "vendor" },
          ],
        },
      },
    },
  },
});
