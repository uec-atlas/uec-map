<template>
  <div class="absolute top-0 left-0 w-full h-fit-content p-2 z-50">
    <UCommandPalette
      class="bg-default rounded-lg ring ring-accented"
      v-model="value"
      v-model:search-term="searchTerm"
      :groups="searchOptions"
      placeholder="検索"
      close
      :fuse="{
        fuseOptions,
        matchAllWhenSearchEmpty: false
      }"
      :ui="{ empty: 'p-0' }"
      @update:open="searchTerm = ''"
    >
      <template #empty>
        <span/>
      </template>
    </UCommandPalette>
  </div>
</template>

<script lang="ts" setup>
import type { CommandPaletteItem } from "@nuxt/ui";

const value = ref<CommandPaletteItem | null>(null);
const searchTerm = ref("");

watch(value, (newValue) => {
  if (!newValue) return;
  const mapState = useMapState();
  mapState.selectedObject.value = newValue.value;
  value.value = null;
  searchTerm.value = "";
});

const { searchOptions, fuseOptions } = useSearchOptions();

</script>
