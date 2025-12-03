// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
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
