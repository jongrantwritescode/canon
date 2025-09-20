import { defineConfig } from "vite";

export default defineConfig({
  root: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    host: true,
  },
});
