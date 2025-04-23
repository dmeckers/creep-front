<script setup lang="ts">
import { onMounted, ref } from "vue";

defineProps({
  text: {
    type: String,
    required: true,
  },
  speed: {
    type: Number,
    default: 50,
  },
  pauseOnHover: {
    type: Boolean,
    default: true,
  },
  gap: {
    type: Number,
    default: 50,
  },
});

const shouldAnimate = ref(false);
const contentRef = ref<HTMLDivElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (!contentRef.value || !containerRef.value) {
    return;
  }

  shouldAnimate.value =
    contentRef.value.clientWidth >= containerRef.value.clientWidth;
});
</script>

<template>
  <div
    class="marquee-container"
    :class="shouldAnimate ? 'fadeout-horizontal' : ''"
    ref="containerRef"
  >
    <div
      class="marquee-content"
      :class="shouldAnimate ? 'animated' : ''"
      :style="`--speed:  ${speed}`"
      ref="contentRef"
    >
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<style lang="css" scoped>
.marquee-container {
  width: 100%;
  position: relative;
  overflow: scroll;
}

.marquee-container::-webkit-scrollbar {
  display: none;
}

.marquee-content {
  width: max-content;
}

.animated {
  animation: marquee-animation calc(100s / var(--speed)) linear infinite;
}

.fadeout-horizontal {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 2rem,
    black calc(100% - 2rem),
    transparent
  );
}

@keyframes marquee-animation {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-120%);
  }
}
</style>
