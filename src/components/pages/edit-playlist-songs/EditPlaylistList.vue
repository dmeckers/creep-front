<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useGetResource } from "@/composables/useResource";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute } from "vue-router";
import type { PaginatedPlaylistSongs } from "@/models/playlist.model";
import { toast } from "vue-sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { useHowler } from "@/composables/useSyncPlayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import _axios from "@/services/axios";
import {
  type GetPaginatedPayload,
  type PaginationMeta,
} from "@/models/shared.models";

const { params } = useRoute();
const { playFromStart, stop } = useHowler();
const playingSongId = ref<number | null>(null);
const busySongId = ref<number | null>(null);

const {
  fetchData: getPlaylist,
  isInitialLoad: isPlaylistInitialLoad,
  data: playlistData,
  error: hasPlaylistError,
  isLoading: isPlaylistLoading,
} = useGetResource<{ data: PaginatedPlaylistSongs }, GetPaginatedPayload>(
  `api/v1/playlists/${params.playlistId}/songs`
);

watch([hasPlaylistError], ([error]) => {
  if (error) {
    return toast.error("Failed to fetch playlist");
  }
});

const playSong = (songId: number) => {
  if (playingSongId.value != null) {
    stop();
  }

  const song = playlistData.value?.data.songs.data.find((s) => s.id === songId);

  playingSongId.value = songId;

  playFromStart(song?.code ?? "");
};

const paginationMessage = computed(() => {
  console.log("Calculating pagination message...", playlistData.value);

  const meta = playlistData.value?.data.songs;

  console.log("Pagination Meta:", meta);
  if (!meta || !meta.total) {
    return "No songs found";
  }
  const { per_page, current_page, total } = meta;

  const showing =
    per_page * current_page >= total ? total : per_page * current_page;

  return `Showing ${showing} of ${total} songs`;
});

const songs = computed(() => playlistData.value?.data.songs.data || []);
const meta = computed<PaginationMeta | undefined>(
  () => playlistData.value?.data.songs
);

const removeSongFromPlaylist = async (songId: number) => {
  busySongId.value = songId;

  if (playingSongId.value === songId) {
    const song = playlistData.value?.data.songs.data.find(
      (s) => s.id === songId
    );

    stop(song?.code ?? "");

    playingSongId.value = null;
  }

  try {
    await _axios.delete(
      `api/v1/playlists/${params.playlistId}/songs/${songId}`
    );

    if (!playlistData.value) {
      return;
    }

    playlistData.value = {
      ...playlistData.value,
      data: {
        ...playlistData.value.data,
        songs: {
          ...playlistData.value.data.songs,
          data: playlistData.value.data.songs.data.filter(
            (song) => song.id !== songId
          ),
        },
      },
    };
  } catch (error) {
    toast.error("Failed to remove song from playlist");
  } finally {
    busySongId.value = null;
  }
};

onMounted(() => getPlaylist());

onBeforeUnmount(() => stop());
</script>
<template>
  <Skeleton
    v-if="isPlaylistLoading && isPlaylistInitialLoad"
    class="h-[50vh] w-full rounded-xl"
  />

  <ScrollArea
    v-if="!isPlaylistInitialLoad && !isPlaylistLoading"
    class="h-[50vh] w-full rounded-md border p-4"
  >
    <template v-for="song in playlistData?.data.songs.data" :key="song.id">
      <!-- <SongListCard :song="song" /> -->

      <div
        class="flex items-center justify-between p-2 hover:bg-muted rounded-md"
        :class="{
          'bg-muted': busySongId === song.id,
          'opacity-50': busySongId === song.id,
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

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <PlusCircle />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="removeSongFromPlaylist(song.id)">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator
        v-if="playlistData && song !== songs[songs.length - 1]"
        class="my-2"
      />
    </template>
  </ScrollArea>

  <template v-if="paginationMessage">
    <div class="w-full flex items-center justify-center mt-4">
      <Button
        variant="ghost"
        size="icon"
        v-if="(meta?.current_page || 1) > 1"
        @click="
          getPlaylist({
            page: (meta?.current_page || 0) + 1,
            page_size: meta?.per_page || 10,
          })
        "
      >
        <ChevronLeft />
      </Button>
      <span class="text-xs font-medium text-muted-foreground">
        {{ paginationMessage }}
      </span>
      <Button
        v-if="(meta?.current_page || 1) < (meta?.last_page || 1)"
        variant="ghost"
        size="icon"
        @click="
          getPlaylist({
            page: (meta?.current_page || 2) - 1,
            page_size: meta?.per_page || 10,
          })
        "
      >
        <ChevronRight />
      </Button>
    </div>
  </template>
</template>
<style scoped>
[id^="reka-dropdown-menu-trigger-"] {
  padding: 0;
}
</style>
