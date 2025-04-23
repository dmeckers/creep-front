<script setup lang="ts">
import type { PaginationListProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import { PaginationList, useForwardProps } from "reka-ui";

const props = withDefaults(
  defineProps<
    PaginationListProps & {
      class?: HTMLAttributes["class"];
      itemCount: number;
      currentPage?: number;
      perPage?: number;
    }
  >(),
  {
    currentPage: 1,
    perPage: 10,
  }
);

const delegatedProps = reactiveOmit(props, [
  "class",
  "itemCount",
  "currentPage",
  "perPage",
]);
const forwarded = useForwardProps(delegatedProps);

// Generate pagination items
const generateItems = computed(() => {
  const totalPages = Math.ceil(props.itemCount / props.perPage);
  const items = [];

  // First page
  items.push({ type: "page", value: 1 });

  // Add ellipsis if needed
  if (props.currentPage > 3) {
    items.push({ type: "ellipsis" });
  }

  // Pages around current
  for (
    let i = Math.max(2, props.currentPage - 1);
    i <= Math.min(totalPages - 1, props.currentPage + 1);
    i++
  ) {
    items.push({ type: "page", value: i });
  }

  // Add ellipsis if needed
  if (props.currentPage < totalPages - 2) {
    items.push({ type: "ellipsis" });
  }

  // Last page if not already included
  if (totalPages > 1) {
    items.push({ type: "page", value: totalPages });
  }

  return items;
});
</script>

<template>
  <PaginationList
    data-slot="pagination-list"
    :class="cn('flex items-center gap-1', props.class)"
    v-bind="forwarded"
  >
    <slot :items="generateItems"></slot>
  </PaginationList>
</template>
