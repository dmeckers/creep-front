<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, ClipboardPaste, File, Plus } from "lucide-vue-next";
import { usePostResource } from "@/composables/useResource";
import type { Song } from "@/models/song.model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UploadSongPayload = {
  file: File;
  code: string;
  name: string;
  artist: string;
  playlistId: string;
};

export type SongUrlWithProvider = {
  url: string;
  provider: SUPPORTED_MUSIC_PROVIDERS;
};

import { computed, ref, watch } from "vue";
import { TypedFormData } from "@/lib/typed-form-data";
import getArtistTitle from "get-artist-title";
import { toast } from "vue-sonner";
import {
  ALL_SUPPORTED_MUSIC_PROVIDERS,
  SUPPORTED_MUSIC_PROVIDERS,
} from "@/models/shared.models";

const fileInput = ref<HTMLInputElement | null>(null);
const urlInput = ref<string>("");

const {
  postData: uploadSong,
  error: hasFailedUploadSong,
  isLoading: isUploadingSong,
} = usePostResource<Song[], UploadSongPayload>("api/v1/songs");

const triggerFileInput: () => void = () => fileInput.value?.click();

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

    emit("file-uploaded");
  }
};

const handlePasteFromClipboard = () => {
  navigator.clipboard.readText().then((text) => {
    if (text) {
      urlInput.value = text;
    }
  });
};

const handleUploadWithUrl = async () => {
  const url = urlInput.value.trim();

  if (!isValidUrl.value) {
    return toast.error("Invalid URL. Please enter a valid song URL.");
  }

  const payload: SongUrlWithProvider = {
    url,
    provider: ALL_SUPPORTED_MUSIC_PROVIDERS.find((provider) =>
      url.includes(provider)
    )!,
  };

  emit("queue-song-upload", payload);

  const { postData, error, data } = usePostResource(
    `api/v1/songs/${payload.provider}/upload`
  );

  await postData(payload);

  console.log("Song upload response:", data.value);

  if (error.value) {
    console.error("Failed to upload song:", error.value);

    emit("url-upload-failed", payload);

    toast.error(
      `Failed to upload song from ${payload.provider}. Please try again.`
    );
    return;
  }
};

const emit = defineEmits<{
  (e: "file-uploaded"): void;
  (e: "queue-song-upload", payload: SongUrlWithProvider): void;
  (e: "url-upload-failed", payload: SongUrlWithProvider): void;
}>();

const isValidUrl = computed(() => {
  const url = urlInput.value.trim();

  return (
    url.length > 0 &&
    (url.startsWith("http://") || url.startsWith("https://")) &&
    ALL_SUPPORTED_MUSIC_PROVIDERS.some((provider) => url.includes(provider))
  );
});

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

  <Dialog>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          :disabled="isUploadingSong"
          class="my-2 flex justify-self-end align-items-center"
        >
          Add song <Plus />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>Upload options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DialogTrigger as-child>
          <DropdownMenuItem> <Link /> Paste url </DropdownMenuItem>
        </DialogTrigger>
        <DropdownMenuItem @click="triggerFileInput"
          ><File /> Browse files</DropdownMenuItem
        >
      </DropdownMenuContent>
    </DropdownMenu>

    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Get song</DialogTitle>
        <DialogDescription>
          Supported sources: {{ ALL_SUPPORTED_MUSIC_PROVIDERS.join(", ") }}.
        </DialogDescription>
      </DialogHeader>
      <div class="flex items-center space-x-2">
        <div class="grid flex-1 gap-2">
          <Label for="link" class="sr-only"> Link </Label>
          <Input id="link" placeholder="Enter url here..." v-model="urlInput" />
        </div>
        <Button
          type="submit"
          size="icon"
          class="px-3"
          @click="handlePasteFromClipboard"
        >
          <ClipboardPaste class="w-4 h-4" />
        </Button>
      </div>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button
            type="button"
            variant="default"
            :disabled="isUploadingSong || !isValidUrl"
            @click="handleUploadWithUrl"
          >
            Enter
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
