import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@boostlly/core": path.resolve(__dirname, "../../packages/core/src"),
      "@boostlly/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@boostlly/features": path.resolve(
        __dirname,
        "../../packages/features/src",
      ),
      "@boostlly/platform": path.resolve(
        __dirname,
        "../../packages/platform/src",
      ),
      "@boostlly/platform-web": path.resolve(
        __dirname,
        "../../packages/platform-web/src",
      ),
      "@boostlly/platform-extension": path.resolve(
        __dirname,
        "../../packages/platform-extension/src",
      ),
    },
  },
  build: {
    emptyOutDir: true, // Always clean dist folder before building
    rollupOptions: {
      external: ["recharts"], // Externalize recharts since it's optional and not used in extension
      input: {
        index: path.resolve(__dirname, "src/newtab/index.html"),
        popup: path.resolve(__dirname, "src/popup/index.html"),
        options: path.resolve(__dirname, "src/options/index.html"),
        background: path.resolve(
          __dirname,
          "src/background/simple-background.ts",
        ),
        // Use simple, self-contained content script to ensure MV3 compatibility in tests
        content: path.resolve(__dirname, "src/content/simple-content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()
            : "chunk";
          if (chunkInfo.name && chunkInfo.name.includes("node_modules")) {
            return "vendor/[name].js";
          }
          return "[name].js";
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".html")) {
            return "[name].html";
          }
          return "[name].[ext]";
        },
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@boostlly/ui"],
          core: ["@boostlly/core"],
          features: ["@boostlly/features"],
          platform: ["@boostlly/platform-extension"],
        },
      },
    },
    target: "esnext",
    minify: false,
  },
  publicDir: "public",
});
