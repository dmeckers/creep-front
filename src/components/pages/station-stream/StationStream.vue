<script setup lang="ts">
import { useWs } from "@/composables/useWs";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import _axios from "@/services/axios";
import { useStationQueue } from "@/composables/useStationQueue";
import { RouteNames } from "@/constants/route-names";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import type { TrackPlayedEventPayload } from "@/composables/useStationPlayback";
import { useHowler } from "@/composables/useHowler";
import { Play, Pause } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const { params } = useRoute();
const stationName = params.stationName as string;

const { listen: listenWs, unlisten } = useWs();
const { current: currentTrack } = useStationQueue({ stationName });
const { play, stop } = useHowler();
const isGettingFirstSong = ref(true);
const isPlaying = ref(false);

const router = useRouter();
let isListening = false;

const getCurrentPlayingTrack =
  async (): Promise<TrackPlayedEventPayload | null> => {
    const nowPlaying = await currentTrack();

    if (!nowPlaying) {
      router.push({ name: RouteNames.HOME });
      return null;
    }

    return nowPlaying;
  };

const onPlayButtonClicked = async () => {
  if (isPlaying.value === false) {
    isPlaying.value = true;

    const nowPlaying = await getCurrentPlayingTrack();

    if (!nowPlaying) return;

    await play(nowPlaying);

    if (isListening) return;

    listenWs("station." + stationName, "track.started", play);

    isListening = true;

    return;
  }

  if (isPlaying.value === true) {
    isPlaying.value = false;
    stop();
    if (isListening) {
      unlisten("station." + stationName, "track.started");
      isListening = false;
    }
  }
};

onMounted(async () => {
  await getCurrentPlayingTrack();

  isGettingFirstSong.value = false;
});

onBeforeUnmount(() => {
  stop();
  isListening = false;
  unlisten("station." + stationName, "track.started");
});
</script>

<template>
  <div
    class="w-full flex justify-center items-center h-[60vh]"
    v-if="isGettingFirstSong"
  >
    <Spinner :size="60" :color="'#ff1d5e'" />
  </div>

  <div v-else class="w-full flex justify-center items-center h-[60vh]">
    <Button @click="onPlayButtonClicked">
      <template v-if="!isPlaying"> <Play class="w-4 h-4" /> Play </template>
      <template v-if="isPlaying"> <Pause class="w-4 h-4" /> Pause </template>
    </Button>
  </div>
</template>

<style scoped></style>
