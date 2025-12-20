<script lang="ts" setup>
useHead({
  htmlAttrs: {
    lang: "ja",
  },
  title: "UEC学内マップ",
  meta: [
    {
      name: "description",
      content:
        "UEC学内マップは、電気通信大学のキャンパス内の建物や施設の情報を提供する地図アプリケーションです。",
    },
    {
      property: "og:title",
      content: "UEC学内マップ",
    },
    {
      property: "og:description",
      content:
        "UEC学内マップは、電気通信大学のキャンパス内の建物や施設の情報を提供する地図アプリケーションです。",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "https://uec-map.e-chan.me/",
    },
    {
      property: "og:image",
      content: "https://uec-map.e-chan.me/og.png",
    },
    {
      property: "og:image:width",
      content: 1200,
    },
    {
      property: "og:image:height",
      content: 630,
    },
    {
      property: "og:image:type",
      content: "image/png",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
      tagPriority: -10,
    },
    {
      name: "twitter:image",
      content: "https://uec-map.e-chan.me/og.png",
      tagPriority: -10,
    },
  ],
  script: [
    {
      src: "https://static.cloudflareinsights.com/beacon.min.js",
      async: true,
      defer: true,
      "data-cf-beacon": '{"token": "c7bd1dd5933044bea1c7ba6dd5f676dd"}',
    },
  ],
});
</script>

<template>
  <UApp>
    <NuxtPage/>
  </UApp>
</template>

<style lang="scss">
html, body, #__nuxt {
  width: 100dvw;
  height: 100dvh;
  margin: 0;
}
</style>
