import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  // K8s Ingress에서 /mobile 경로로 서빙 — 정적 에셋이 /mobile/assets/... 로 빌드됨.
  // Capacitor 네이티브 빌드(pnpm run android/ios)에서는 VITE_BUILD_FOR_NATIVE=true 로 덮어씀.
  base: process.env.VITE_BUILD_FOR_NATIVE ? "/" : "/mobile",
  plugins: [vue()],
  envPrefix: ["VITE_"],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8081,
  },
});
