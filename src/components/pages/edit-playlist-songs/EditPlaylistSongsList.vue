<script setup lang="ts">
import { useGetResource, usePatchResource } from "@/composables/useResource";
import type { Playlist } from "@/models/playlist.model";
import {
  calculateShowing,
  type PaginatedResponse,
} from "@/models/shared.models";
import type { Song } from "@/models/song.model";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Play,
  Pause,
} from "lucide-vue-next";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useHowlerPlayer } from "@/composables/useHowlerPlayer";

type GetSongsPayload = {
  page: number;
  page_size: number;
  name?: string;
  exclude_playlist_id: number;
};

const songIdThatIsAdding = ref<number | null>(null);
const songNameSearchQuery = ref<string>("");
const playingSongId = ref<number | null>(null);

const {
  isLoading: areSongsLoading,
  error: hasSongsErorrs,
  fetchData: getSongs,
  data: songsData,
  isInitialLoad: isSongsInitialLoad,
} = useGetResource<PaginatedResponse<Song>, GetSongsPayload>("api/v1/songs");

const { params } = useRoute();
const { play, stop } = useHowlerPlayer();

const paginationMessage = computed(() => calculateShowing(songsData.value));

const { error: failedAdd, patchData: addToPlaylist } = usePatchResource<
  Playlist,
  { songId: number; playlistId: number }
>(`api/v1/playlists/${params.playlistId}/songs`);

const addSongToPlaylist = async (songId: number) => {
  if (playingSongId.value === songId) {
    const song = songsData.value?.data.find((s) => s.id === songId);
    stop(song?.code ?? "");
    playingSongId.value = null;
  }

  songIdThatIsAdding.value = songId;

  await addToPlaylist({
    songId: songId,
    playlistId: Number(params.playlistId),
  });

  const filtered = songsData.value?.data.filter((song) => song.id !== songId);

  if (songsData.value && filtered) {
    songsData.value.data = filtered;
    let total = songsData.value.meta.total;
    songsData.value.meta.total = total > 0 ? --total : total;
  }

  toast.success("Song added to playlist");

  songIdThatIsAdding.value = null;
};

watch([hasSongsErorrs, failedAdd], ([songsError, addError]) => {
  if (songsError) {
    return toast.error("Failed to fetch songs");
  }

  if (addError) {
    return toast.error("Failed to add song to playlist");
  }
});

onMounted(async () => {
  await getSongs({
    page: 1,
    page_size: 10,
    name: songNameSearchQuery.value,
    exclude_playlist_id: Number(params.playlistId),
  });
});

const playSong = (songId: number) => {
  
  if (playingSongId.value != null) {
    stop();

    if (playingSongId.value === songId) {
      playingSongId.value = null;
      return;
    }
  }

  const song = songsData.value?.data.find((s) => s.id === songId);

  playingSongId.value = songId;

  play(song?.code ?? "");
};

defineExpose({ getSongs });

onBeforeUnmount(() => stop());
</script>
<template>
  <div class="relative w-full max-w-sm items-center mt-2">
    <Input
      id="search"
      type="text"
      placeholder="Search..."
      class="pl-10"
      v-model="songNameSearchQuery"
    />
    <span
      class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
    >
      <Search class="size-6 text-muted-foreground" />
    </span>
  </div>

  <Skeleton
    v-if="areSongsLoading && isSongsInitialLoad"
    class="h-[50vh] w-full rounded-xl"
  />

  <ScrollArea class="w-full rounded-md border p-4 h-[50vh]">
    <template v-for="song in songsData?.data" :key="song.id">
      <!-- <SongListCard :song="song" /> -->

      <div
        class="flex items-center justify-between p-2 hover:bg-muted rounded-md"
        :class="{
          'bg-muted': songIdThatIsAdding === song.id,
          'cursor-pointer': songIdThatIsAdding === song.id,
        }"
      >
        <div class="flex flex-col items-start">
          <span>
            {{ song.name }}
          </span>
          <span class="text-sm text-muted-foreground">
            {{ song.artist }}
          </span>
        </div>

        <div>
          <Button variant="ghost" size="icon" @click="playSong(song.id)">
            <Play v-if="playingSongId !== song.id" />
            <Pause v-else />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            @click="addSongToPlaylist(song.id)"
          >
            <PlusCircle />
          </Button>
        </div>
      </div>

      <Separator
        v-if="song !== songsData?.data[songsData.data.length - 1]"
        class="my-2"
      />
    </template>
  </ScrollArea>

  <template v-if="paginationMessage">
    <div class="w-full flex items-center justify-center mt-4">
      <Button
        variant="ghost"
        size="icon"
        v-if="(songsData?.meta.current_page || 1) > 1"
        @click="
          getSongs({
            page: (songsData?.meta.current_page || 0) + 1,
            page_size: songsData?.meta.per_page || 10,
            exclude_playlist_id: Number(params.playlistId),
          })
        "
      >
        <ChevronLeft />
      </Button>
      <span class="text-xs font-medium text-muted-foreground">
        {{ paginationMessage }}
      </span>
      <Button
        v-if="
          (songsData?.meta.current_page || 1) < (songsData?.meta.last_page || 1)
        "
        variant="ghost"
        size="icon"
        @click="
          getSongs({
            page: (songsData?.meta.current_page || 2) - 1,
            page_size: songsData?.meta.per_page || 10,
            exclude_playlist_id: Number(params.playlistId),
          })
        "
      >
        <ChevronRight />
      </Button>
    </div>
  </template>
</template>
