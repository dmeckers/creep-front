<script setup lang="ts">
import { useWs } from "@/composables/useWs";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import _axios from "@/services/axios";
import {
  useStationQueue,
  type QueuedTrack,
} from "@/composables/useStationQueue";
import { RouteNames } from "@/constants/route-names";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useSyncPlayer } from "@/composables/useSyncPlayer";
import { Play, Pause, Timer } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import SimpleAudioVisualizer from "@/components/ui/simple-audio-visualizer/SimpleAudioVisualizer.vue";
import { useGetResource } from "@/composables/useResource";
import type { Station } from "@/models/station.model";
import TextMarquee from "@/components/ui/text-marquee/TextMarquee.vue";

const { params } = useRoute();
const stationName = params.stationName as string;

const { listen, unlisten } = useWs();
const { current: currentTrack } = useStationQueue({ stationName });
const { play, stop, syncNow } = useSyncPlayer();

const isGettingFirstSong = ref(true);
const isPlaying = ref(false);
const isSyncing = ref(false);
const nowPlaying = ref<QueuedTrack | null>(null);

const router = useRouter();
let isListening = false;

const getCurrentPlayingTrack = async (): Promise<QueuedTrack | null> => {
  const nowPlaying = await currentTrack();

  if (!nowPlaying) {
    router.push({ name: RouteNames.HOME });
    return null;
  }

  return nowPlaying;
};

const { data, fetchData } = useGetResource<{
  data: Station;
}>(`api/v1/stations/${stationName}`);

const sync = async () => {
  if (isSyncing.value) return;
  console.log("Syncing now...");

  isSyncing.value = true;

  if (!nowPlaying.value) throw new Error("No current track found");

  const info = await syncNow({ track: nowPlaying.value });

  console.log("Resynced", info);
  isSyncing.value = false;
};

const onPlayButtonClicked = async () => {
  if (!isPlaying.value) {
    isPlaying.value = true;

    const current = await getCurrentPlayingTrack();
    if (!current) return;

    nowPlaying.value = current;
    await play({ track: nowPlaying.value });

    if (!isListening) {
      listen(
        "station." + stationName.trim(),
        "track.started",
        async (track) => {
          console.log("Track started:", track);
          await play(track);
        }
      );
      isListening = true;
    }
  } else {
    isPlaying.value = false;
    stop();
    if (isListening) {
      unlisten("station." + stationName, "track.started");
      isListening = false;
    }
  }
};

onMounted(async () => {
  const current = await getCurrentPlayingTrack();

  isGettingFirstSong.value = false;

  if (!current) return;

  nowPlaying.value = current;

  fetchData();

  listen(
    "station." + stationName.trim(),
    "track.started",
    async ({ track }: { track: QueuedTrack }) => {
      nowPlaying.value = track;
    }
  );
});

onBeforeUnmount(() => {
  stop();
  isListening = false;
  unlisten("station." + stationName, "track.started");
});
</script>

<template>
  <SimpleAudioVisualizer class="visualizer" />
  <div
    class="w-full flex justify-center items-center h-[60vh]"
    v-if="isGettingFirstSong"
  >
    <Spinner :size="60" :color="'#ff1d5e'" />
  </div>

  <div
    v-else
    class="w-full flex justify-center items-center h-[60vh] flex-col gap-4 content"
  >
    <div v-if="data">
      <h3 class="text-1xl my-1">You are now listening to the station:</h3>
      <h2 class="text-2xl font-bold mb-2">
        {{ data.data.name }}
      </h2>

      <span class="text-sm text-muted" v-if="data.data.description">
        {{ data.data.description }}
      </span>
    </div>

    <Button @click="onPlayButtonClicked">
      <template v-if="!isPlaying"> <Play class="w-4 h-4" /> Play </template>
      <template v-if="isPlaying"> <Pause class="w-4 h-4" /> Pause </template>
    </Button>

    <Button v-if="isPlaying" @click="sync" :disabled="isSyncing">
      <Timer class="w-4 h-4" /> {{ isSyncing ? "Syncing..." : "Sync Now" }}
    </Button>

    <div v-if="nowPlaying" class="w-[100%]">
      <TextMarquee :text="`Now playing: ${nowPlaying.song.name}`" :speed="3" />

      <span class="text-sm text-muted" v-if="nowPlaying.song.artist">
        {{ nowPlaying.song.artist }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.visualizer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.25;
}

.content {
  position: relative;
  z-index: 2;
}
</style>
