<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    default: "self-building-square-spinner",
  },
  size: {
    type: Number,
    default: 40,
  },
  color: {
    type: String,
    default: "#ff1d5e",
  },
});
</script>

<template>
  <div
    class="self-building-square-spinner"
    :style="{
      height: `${props.size}px`,
      width: `${props.size}px`,
    }"
  >
    <div
      v-for="n in 9"
      :key="n"
      class="square"
      :class="{ clear: [4, 7].includes(n) }"
      :style="{
        height: `${props.size / 4}px`,
        width: `${props.size / 4}px`,
        marginRight: `${props.size / 12}px`,
        marginTop: `${props.size / 12}px`,
        background: props.color,
        animationDelay: `${300 * delayMap[n - 1]}ms`,
      }"
    ></div>
  </div>
</template>

<script lang="ts">
const delayMap = [6, 7, 8, 3, 4, 5, 0, 1, 2];
</script>

<style scoped>
.self-building-square-spinner,
.self-building-square-spinner * {
  box-sizing: border-box;
}

.self-building-square-spinner .square {
  float: left;
  position: relative;
  opacity: 0;
  animation: self-building-square-spinner 6s infinite;
}

.self-building-square-spinner .clear {
  clear: both;
}

@keyframes self-building-square-spinner {
  0% {
    opacity: 0;
  }
  5% {
    opacity: 1;
    top: 0;
  }
  50.9% {
    opacity: 1;
    top: 0;
  }
  55.9% {
    opacity: 0;
    top: inherit;
  }
}
</style>
