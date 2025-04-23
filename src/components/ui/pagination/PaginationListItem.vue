<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    value?: string | number;
    active?: boolean;
    disabled?: boolean;
    class?: HTMLAttributes["class"];
    onClick?: () => void;
  }>(),
  {
    active: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  if (!props.disabled && props.onClick) {
    props.onClick();
  }

  if (!props.disabled) {
    emit("click");
  }
}
</script>

<template>
  <button
    type="button"
    data-slot="pagination-list-item"
    :disabled="props.disabled"
    :aria-current="props.active ? 'page' : undefined"
    :class="
      cn(
        'flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors',
        'hover:bg-muted',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        props.active
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'text-foreground',
        props.disabled && 'pointer-events-none opacity-50',
        props.class
      )
    "
    @click="handleClick"
  >
    <slot>{{ props.value }}</slot>
  </button>
</template>
