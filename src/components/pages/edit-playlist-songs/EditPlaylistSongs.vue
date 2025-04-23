<script lang="ts" setup>
import SongListCard from "@/components/ui/song-list-card/SongListCard.vue";
import { Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ref, watch } from "vue";
import _axios from "@/services/axios";
import { usePostResource } from "@/composables/useResource";
import { TypedFormData } from "@/lib/typed-form-data";
import getArtistTitle from "get-artist-title";
import { toast } from "vue-sonner";
import EditPlaylistSongsList from "@/components/pages/edit-playlist-songs/EditPlaylistSongsList.vue";
import EditPlaylistList from "@/components/pages/edit-playlist-songs/EditPlaylistList.vue";
import type { Song } from "@/models/song.model";

type UploadSongPayload = {
  file: File;
  code: string;
  name: string;
  artist: string;
  playlistId: string;
};

const fileInput = ref<HTMLInputElement | null>(null);
const songsC = ref<InstanceType<typeof SongListCard> | null>(null);

const {
  postData: uploadSong,
  error: hasFailedUploadSong,
  isLoading: isUploadingSong,
} = usePostResource<Song[], UploadSongPayload>("api/v1/songs");

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .replace(/[^a-zA-Z0-9]/g, "") // Remove special chars and spaces
    .toLowerCase(); // Convert to lowercase
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    const file = files[0];

    const formData = new TypedFormData<UploadSongPayload>();

    const [, title] = getArtistTitle(file.name) ?? [null, file.name];

    formData.append("file", file);
    formData.append("name", title);
    formData.append("code", sanitizeFileName(title));

    await uploadSong(formData);

    await (songsC.value as any)?.getSongs();
  }
};

const triggerFileInput: () => void = () => fileInput.value?.click();

watch([hasFailedUploadSong], ([upload]) => {
  if (upload) {
    return toast.error("Failed to upload song");
  }
});
</script>

<template>
  <input
    type="file"
    id="file"
    class="hidden"
    ref="fileInput"
    accept="audio/*"
    @change="handleFileChange"
  />
  <Button
    @click="triggerFileInput"
    :disabled="isUploadingSong"
    class="my-2 flex justify-self-end align-items-center"
  >
    Add song <Plus />
  </Button>

  <Tabs default-value="playlist" class="w-full mt-5">
    <TabsList class="w-full">
      <TabsTrigger value="playlist"> Playlist </TabsTrigger>
      <TabsTrigger value="songs"> Songs </TabsTrigger>
    </TabsList>

    <TabsContent value="songs">
      <EditPlaylistSongsList ref="songsC" />
    </TabsContent>

    <TabsContent value="playlist">
      <EditPlaylistList />
    </TabsContent>
  </Tabs>
</template>

<style scoped></style>
