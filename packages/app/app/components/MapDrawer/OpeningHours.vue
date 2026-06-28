<script lang="ts" setup>
interface Props {
  spec: {
    dayOfWeek: string;
    opens: string;
    closes: string;
  }[];
}
const props = defineProps<Props>();

const dayOfWeekMap: Record<string, string> = {
  Monday: "月",
  Tuesday: "火",
  Wednesday: "水",
  Thursday: "木",
  Friday: "金",
  Saturday: "土",
  Sunday: "日",
};
const formattedOpeningHours = computed(() => {
  const grouped = new Map<string, string[]>();
  for(const day of Object.values(dayOfWeekMap)) {
    grouped.set(day, []);
  }
  for (const spec of props.spec) {
    const dayOfWeek = dayOfWeekMap[spec.dayOfWeek] ?? spec.dayOfWeek;
    const opens = spec.opens.split(":").slice(0, 2).join(":");
    const closes = spec.closes.split(":").slice(0, 2).join(":");
    const range = `${opens} - ${closes}`;
    const ranges = grouped.get(dayOfWeek);
    if (ranges) {
      ranges.push(range);
    } else {
      grouped.set(dayOfWeek, [range]);
    }
  }
  return Array.from(grouped.entries()).map(([dayOfWeek, ranges]) => ({
    dayOfWeek,
    range: ranges.length > 0 ? ranges.join(", ") : "休業",
  }));
});
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <h3 class="text-lg text-center font-semibold mb-2 self-start">営業時間</h3>
    <table class="table-auto w-full border-t border-gray-200 dark:border-gray-700 text-sm">
      <tbody>
        <tr
          v-for="(item, index) in formattedOpeningHours"
          :key="index"
          class="border-b border-gray-200 dark:border-gray-700">
          <th class="px-4 py-2 font-semibold">{{ item.dayOfWeek }}</th>
          <td class="px-4 py-2">{{ item.range }}</td>
        </tr>
      </tbody>
    </table>
    <p class="text-xs text-muted-foreground mb-2">
      ※営業時間は行事等により変更される場合があります。
    </p>
  </div>
</template>
