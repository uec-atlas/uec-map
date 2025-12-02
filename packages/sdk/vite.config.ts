import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = resolve();

export default defineConfig(({ mode }) => {
  const isUMD = mode === "umd";

  return {
    build: {
      minify: isUMD,
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, "src/main.ts"),
        name: "UECMap",
        fileName: (format) => (format === "umd" ? "main.js" : "main.mjs"),
        formats: isUMD ? ["umd"] : ["es"],
        cssFileName: "style",
      },
      rollupOptions: {
        external: isUMD ? [] : ["maplibre-gl"],
        output: {
          globals: {
            "maplibre-gl": "maplibregl",
          },
        },
      },
    },
    assetsInclude: ["**/*.pmtiles"],
    plugins: [
      !isUMD && dts({ insertTypesEntry: true }),
      viteStaticCopy({
        targets: [
          {
            src: "src/assets/*.pmtiles",
            dest: "assets",
          },
        ],
      }),
    ],
  };
});
