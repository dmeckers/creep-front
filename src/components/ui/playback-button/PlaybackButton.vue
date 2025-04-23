<script setup lang="ts">
import { ref } from "vue";

const isPlaying = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

const togglePlayback = () => {
  if (!audioRef.value) return;

  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  } else {
    audioRef.value.play();
    isPlaying.value = true;
  }
};
</script>

<template>
  <div>
    <button @click="togglePlayback">
      {{ isPlaying ? "⏸ Pause" : "▶️ Play" }}
    </button>

    <audio
      ref="audioRef"
      :src="'https://breezy-pigs-join.loca.lt'"
      preload="none"
    ></audio>
  </div>
</template>
