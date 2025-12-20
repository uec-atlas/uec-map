<template>
  <Teleport to="body">
    <div
      class="absolute top-0 left-0 w-full h-fit-content p-2 z-10 print:hidden"
    >
      <UCommandPalette
        class="bg-default rounded-lg ring ring-accented shadow"
        v-model="value"
        v-model:search-term="searchTerm"
        icon="material-symbols:search"
        :groups="searchOptions"
        placeholder="検索"
        :close="searchTerm.length > 0"
        :fuse="{
          fuseOptions,
          matchAllWhenSearchEmpty: false
        }"
        :ui="{ empty: 'p-0' }"
        @update:open="searchTerm = ''"
      >
        <template #empty>
          <div
            class="p-4 text-sm text-muted-foreground"
            v-if="searchTerm.length > 0"
          >
            一致する結果が見つかりませんでした
          </div>
          <span v-else/>
        </template>
      </UCommandPalette>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import type { CommandPaletteItem } from "@nuxt/ui";

const { selectedObject } = useMapState();
const value = ref<CommandPaletteItem | null>(null);
const searchTerm = ref("");

watch(value, (newValue) => {
  if (!newValue) return;
  const mapState = useMapState();
  mapState.selectedObject.value = newValue.value;
  value.value = null;
  searchTerm.value = "";
});

watch(selectedObject, () => {
  value.value = null;
  searchTerm.value = "";
});

const { searchOptions, fuseOptions } = useSearchOptions();
</script>
