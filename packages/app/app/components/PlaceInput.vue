<template>
  <USelectMenu
    v-model="modelValue"
    :items="selectOptions"
    placeholder="場所を選択"
    :search-input="{ placeholder: '場所を検索' }"
    class="w-full"
    :ui="{ content: 'z-50' }"
  />
</template>

<script lang="ts" setup>
const { selectOptions } = useSearchOptions();
const modelValue = defineModel<typeof selectOptions[number]>();

export type PlaceInputValue = typeof selectOptions[number];
</script>
