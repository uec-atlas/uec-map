// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-09-19",
  devtools: { enabled: true },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  modules: [
    "@vueuse/nuxt",
    "@nuxt/ui",
    "nuxt-maplibre",
    [
      "unplugin-icons/nuxt",
      {
        autoInstall: true,
      },
    ],
  ],
  css: ["@/assets/style.css"],
  routeRules: {
    "/ogp.png": {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
    "/legacy-items.json": {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  },
  vite: {
    assetsInclude: ["**/*.pmtiles"],
  },
});
