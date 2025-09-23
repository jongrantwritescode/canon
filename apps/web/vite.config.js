/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/main.ts"),
      },
    },
  },
  server: {
    port: 8080,
    host: true,
  },
});
