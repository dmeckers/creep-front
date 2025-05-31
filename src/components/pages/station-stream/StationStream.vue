<script setup lang="ts">
import { useWs } from "@/composables/useWs";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import _axios from "@/services/axios";
import { useStationQueue } from "@/composables/useStationQueue";
import { RouteNames } from "@/constants/route-names";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import {
  useSyncPlayer,
  type TrackPlayedEventPayload,
} from "@/composables/useSyncPlayer";
import { Play, Pause, Timer } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const { params } = useRoute();
const stationName = params.stationName as string;

const { listen, unlisten } = useWs();
const { current: currentTrack } = useStationQueue({ stationName });
const { play, stop, preload, syncNow } = useSyncPlayer();

const isGettingFirstSong = ref(true);
const isPlaying = ref(false);
const isSyncing = ref(false);
const nowPlaying = ref<TrackPlayedEventPayload | null>(null);

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

const sync = async () => {
  if (isSyncing.value) return;
  console.log("Syncing now...");

  isSyncing.value = true;

  if (!nowPlaying.value) throw new Error("No current track found");

  const info = await syncNow(nowPlaying.value);

  console.log("Resynced", info);
  isSyncing.value = false;
};

const onPlayButtonClicked = async () => {
  if (!isPlaying.value) {
    isPlaying.value = true;

    const current = await getCurrentPlayingTrack();
    if (!current) return;

    nowPlaying.value = current;
    await play(current);

    if (!isListening) {
      listen("station." + stationName.trim(), "track.started", async (track) => {
        nowPlaying.value = track;
        await play(track);
      });
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

// let interval: number | null = null;

onMounted(async () => {
  const current = await getCurrentPlayingTrack();

  isGettingFirstSong.value = false;

  if (!current) return;

  nowPlaying.value = current;

  //   interval = setInterval(() => nowPlaying.value && sync(), 5000);
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

  <div
    v-else
    class="w-full flex justify-center items-center h-[60vh] flex-col gap-4"
  >
    <Button @click="onPlayButtonClicked">
      <template v-if="!isPlaying"> <Play class="w-4 h-4" /> Play </template>
      <template v-if="isPlaying"> <Pause class="w-4 h-4" /> Pause </template>
    </Button>

    <Button v-if="isPlaying" @click="sync" :disabled="isSyncing">
      <Timer class="w-4 h-4" /> {{ isSyncing ? "Syncing..." : "Sync Now" }}
    </Button>
  </div>
</template>

<style scoped></style>
