// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-maplibre"],
  // Add routeRules so Nitro will send Accept-Ranges header for the pmtiles file
  routeRules: {
    "/map.pmtiles": {
      headers: {
        "accept-ranges": "bytes",
      },
    },
  },
});
