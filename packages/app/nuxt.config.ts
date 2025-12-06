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
  vite: {
    assetsInclude: ["**/*.pmtiles"],
  },
});
