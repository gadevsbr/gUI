import { defineConfig } from "vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";

const codecovToken = process.env.CODECOV_TOKEN;

export default defineConfig({
  root: "website",
  base: "./",
  build: {
    outDir: "../dist-website",
    emptyOutDir: true,
  },
  plugins: [
    codecovVitePlugin({
      enableBundleAnalysis: typeof codecovToken === "string" && codecovToken.length > 0,
      bundleName: "gui-website",
      uploadToken: codecovToken,
    }),
  ],
});
