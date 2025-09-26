/* eslint-env node */
import { resolve } from "path";
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
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
      },
      "/queue": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
      },
      "/job": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
      },
      "/content": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
      },
      "/universes": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
      },
      "/new": {
        target: "http://host.docker.internal:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  esbuild: {
    target: "es2020",
  },
});
