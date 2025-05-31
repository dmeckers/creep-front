<script lang="ts" setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computed, onMounted, onUnmounted, ref } from "vue";
import _axios from "@/services/axios";
import UploadSongButton, {
  type SongUrlWithProvider,
} from "@/components/pages/edit-playlist-songs/UploadSongButton.vue";
import EditPlaylistSongsList from "@/components/pages/edit-playlist-songs/EditPlaylistSongsList.vue";
import EditPlaylistList from "@/components/pages/edit-playlist-songs/EditPlaylistList.vue";
import { usePluralize } from "@/composables/usePluralize";
import { useWs } from "@/composables/useWs";
import { SINGLE_OPERATION_EVENTS } from "@/models/shared.models";
import { toast } from "vue-sonner";
import { useUserStore } from "@/stores/userStore";

const uploadingSongs = ref<SongUrlWithProvider[]>([]);
const { pluralize } = usePluralize();
const { listen, unlisten } = useWs();
const userStore = useUserStore();

const songsComponentRef = ref<InstanceType<
  typeof EditPlaylistSongsList
> | null>(null);

const handleQueueSongUpload = async (song: SongUrlWithProvider) => {
  uploadingSongs.value.push(song);
};

const handleRemoveSongFromQueue = (song: SongUrlWithProvider) => {

  const index = uploadingSongs.value.findIndex((s) => s.url === song.url);

  if (index !== -1) {
    uploadingSongs.value.splice(index, 1);
  }
};

const uploadingCountMsg = computed(() => {
  const count = uploadingSongs.value.length;

  return count ? `Uploading ${count} ${pluralize(count, "song")}...` : "";
});

const handleTriggerFetchSongs = () => songsComponentRef.value?.getSongs();

const userId = userStore.id;
const channel = `user.${userId}.upload-progress`;

onMounted(() => {
  listen(
    channel,
    SINGLE_OPERATION_EVENTS.URL_SONG_DOWNLOAD_FAILED,
    (payload) => {
      handleRemoveSongFromQueue({
        url: payload.url,
        provider: payload.provider,
      });

      toast.error(`Failed to download song from ${payload.provider}: ${payload.url}`, {
        description: payload.error,
      });
    }
  );

  listen(
    channel,
    SINGLE_OPERATION_EVENTS.URL_SONG_DOWNLOAD_SUCCEEDED,
    (payload) => {
      handleRemoveSongFromQueue({
        url: payload.url,
        provider: payload.provider,
      });

      toast.success(`Successfully downloaded song from ${payload.provider}: ${payload.url}`);
    }
  );
});

onUnmounted(() => {
  unlisten(channel, SINGLE_OPERATION_EVENTS.URL_SONG_DOWNLOAD_FAILED);
  unlisten(channel, SINGLE_OPERATION_EVENTS.URL_SONG_DOWNLOAD_SUCCEEDED);
});
</script>

<template>
  <UploadSongButton
    @queue-song-upload="handleQueueSongUpload"
    @url-upload-failed="handleRemoveSongFromQueue"
    @file-uploaded="handleTriggerFetchSongs"
  />

  <div v-if="!!uploadingSongs.length" class="w-full text-left">
    <span class="text-sm text-muted-foreground">
      {{ uploadingCountMsg }}
    </span>
  </div>

  <Tabs default-value="playlist" class="w-full mt-5">
    <TabsList class="w-full">
      <TabsTrigger value="playlist"> Playlist </TabsTrigger>
      <TabsTrigger value="songs"> Songs </TabsTrigger>
    </TabsList>

    <TabsContent value="songs">
      <EditPlaylistSongsList ref="songsComponentRef" />
    </TabsContent>

    <TabsContent value="playlist">
      <EditPlaylistList />
    </TabsContent>
  </Tabs>
</template>

<style scoped></style>
