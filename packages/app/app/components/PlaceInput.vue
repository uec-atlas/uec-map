<template>
  <USelectMenu
    v-model="modelValue"
    :items="items"
    label="場所を選択"
    class="w-full" />
</template>

<script lang="ts" setup>
const { searchOptions } = useSearchOptions();
const items = searchOptions.flatMap(group => group.items.map(item => item));
const modelValue = defineModel<typeof items[number]>();

export type PlaceInputValue = typeof items[number];
</script>
