<script lang="ts" setup>
interface Props {
  properties: {
    maximumAttendeeCapacity: number;
    maximumExamAttendeeCapacity: number;
    seatType: "fixed" | "movable";
  };
}
const props = defineProps<Props>();
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <h3 class="text-lg font-semibold mb-2 self-start">教室情報</h3>
    <table
      class="table-auto w-full text-center border-t border-gray-200 dark:border-gray-700 text-sm"
    >
      <tbody>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="px-4 py-2 font-semibold">授業定員</th>
          <td class="px-4 py-2">
            {{ props.properties.maximumAttendeeCapacity }}人
          </td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="px-4 py-2 font-semibold">試験定員</th>
          <td class="px-4 py-2">
            {{ props.properties.maximumExamAttendeeCapacity }}人
          </td>
        </tr>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="px-4 py-2 font-semibold">座席種別</th>
          <td class="px-4 py-2">
            {{ props.properties.seatType === "fixed" ? "固定" : "可動" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
