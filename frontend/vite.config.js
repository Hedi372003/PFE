  import path from "node:path";
  import { defineConfig, loadEnv } from "vite";
  import react from "@vitejs/plugin-react";

  export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, "");
    const proxyTarget =
      env.VITE_DEV_API_PROXY_TARGET?.trim() ||
      env.VITE_API_BASE_URL?.trim() ||
      "http://127.0.0.1:5000";
    const devPort = Number(env.VITE_DEV_PORT || 5173);

    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      server: {
        host: "127.0.0.1",
        port: devPort,
        proxy: {
          "/api": {
            target: proxyTarget,
            changeOrigin: true,
          },
        },
      },
      preview: {
        host: "127.0.0.1",
        port: devPort,
      },
    };
  });