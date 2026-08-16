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
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["../tests/**/*.test.ts"],
  },
  root: "src",
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
