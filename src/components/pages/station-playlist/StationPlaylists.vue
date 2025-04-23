<script setup lang="ts">
import { useGetResource } from "@/composables/useResource";
import ResourceWrapper from "@/components/ui/resource-wrapper/ResourceWrapper.vue";
import type { Playlist } from "@/models/playlist.model";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import Tumbleweed from "@/components/ui/tumbleweed/Tumbleweed.vue";
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import PlaylistCard from "@/components/ui/playlist-card/PlaylistCard.vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import _axios from "@/services/axios";
import { toast } from "vue-sonner";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-vue-next";
import { Input } from "@/components/ui/input";

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters")
      .regex(/^[a-zA-Z0-9 ]*$/, "Name can only contain letters and numbers")
      .regex(/^[a-zA-Z]/, "Name must start with a letter")
      .max(50, "Name must be less than 50 characters"),
    description: z
      .string()
      .max(200, "Description must be less than 200 characters")
      .optional(),
  })
);
const form = useForm({ validationSchema: formSchema });

const { params } = useRoute();

const GET_STATION_PLAYLISTS_URL = `/api/v1/stations/${params.id}/playlists`;

const isCreatingNewPlaylist = ref(false);

const { data, error, fetchData, isLoading } = useGetResource<{
  data: Playlist[];
}>(GET_STATION_PLAYLISTS_URL);

const createPlaylist = async (payload: object) => {
  try {
    await _axios.post<{ data: { id: number; name: string } }>(
      "/api/v1/playlists",
      {
        ...payload,
        station_id: params.id,
      }
    );
  } catch (error) {
    toast.error(
      (error as any)?.response?.data?.message ||
        "An error occurred while creating the playlist"
    );

    throw error;
  } finally {
    isCreatingNewPlaylist.value = false;
  }
};

const onSubmit = form.handleSubmit(async (values) => {
  await createPlaylist(values);
  await fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <ResourceWrapper :error="error" :isLoading="isLoading" class="mt-6 h-full">
    <PlaylistCard v-for="playlist in data?.data" :playlist="playlist" />

    <div v-if="data?.data.length === 0">
      <template v-if="!isCreatingNewPlaylist">
        <p class="text-xl font-semibold text-gray-700 mb-5">No playlists</p>
        <Button @click="isCreatingNewPlaylist = true" class="cursor-pointer">
          <Label> Create new playlists </Label>
        </Button>
        <Tumbleweed :size="50" />
      </template>

      <template v-if="isCreatingNewPlaylist">
        <form
          @submit.prevent="onSubmit"
          class="h-[65vh] flex flex-col justify-center"
        >
          <FormField v-slot="{ componentField }" name="name">
            <FormItem class="mt-6">
              <FormLabel>Playlist name *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter playlist name"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-left" />
              <FormDescription class="text-xs text-left">
                This is the name of the playlist. It will be used to identify
                the playlist in the system.
              </FormDescription>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem class="mt-6">
              <FormLabel>Playlist description</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter description"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage class="text-left" />
              <FormDescription class="text-xs text-left">
                Provide a brief description of the playlist. Maximum 200
                characters.
              </FormDescription>
            </FormItem>
          </FormField>

          <Button class="mt-16" type="submit" :disabled="isLoading">
            <Loader2 class="w-4 h-4 mr-2 animate-spin" v-if="isLoading" />
            <span>Submit</span>
          </Button>
        </form>
      </template>
    </div>
  </ResourceWrapper>
</template>

<style scoped>
.playlist-playlists {
  padding: 20px;
}
</style>
