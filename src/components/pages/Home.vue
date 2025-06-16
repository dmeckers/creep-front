<script setup lang="ts">
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input/Input.vue";
import { useRouter } from "vue-router";
import { RouteNames } from "@/constants/route-names";
import _axios from "@/services/axios";
import { useDebounceFn } from "@vueuse/core";
import type { PaginatedResponse } from "@/models/shared.models";
import type { Station } from "@/models/station.model";
import { toast } from "vue-sonner";
import { ref } from "vue";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { Flame, Disc3, RadioTower, SmilePlus } from "lucide-vue-next";

const SEARCH_STATION_API_URL = "/api/v1/stations/search";

const router = useRouter();

const goToUserStaion = () => {
  router.push({ name: RouteNames.USER_STATION });
};

const stations = ref<Station[]>([]);
const isSearching = ref(false);

const lastSearchQuery = ref("");

const debouncedSearch = useDebounceFn(async (value: Event) => {
  const input = value.target as HTMLInputElement;
  const query = input.value;

  lastSearchQuery.value = query;

  if (!query || query.length < 1) {
    stations.value = [];
    return;
  }

  try {
    isSearching.value = true;

    const response = await _axios.get<PaginatedResponse<Station>>(
      SEARCH_STATION_API_URL,
      {
        params: {
          query: query,
          page: 1,
        },
      }
    );

    stations.value = response.data.data;
  } catch (error) {
    toast.error("Error while searching for stations");
  } finally {
    isSearching.value = false;
  }
}, 700);

const goToStationStream = (stationName: string) => {
  router.push({
    path: `/stations/${stationName}/stream`,
  });
};

const notifications = [
  {
    title: "Create your own station",
    description: "Synchronized as much as possible",
    icon: RadioTower,
  },
  {
    title: "Create playlist",
    description: "Feed it with links from YouTube, Spotify, SoundCloud, etc.",
    icon: Disc3,
  },
  {
    title: "Turn it on and listen",
    description: "Below you can search for running stations",
    icon: Flame,
  },
  {
    title: "More features in future",
    description: "We are working on it",
    icon: SmilePlus,
  },
];
</script>

<template>
  <ScrollArea class="h-[85%] w-full rounded-md border p-4 mt-5">
    <div
      v-if="!isSearching && lastSearchQuery === ''"
      class="flex flex-col items-center"
      style="height: 100%"
    >
      <div class="self-start text-lg">
        <span>How to use </span>
      </div>

      <div class="flex flex-col justify-center flex-grow w-full h-full mt-8">
        <div
          v-for="(notification, index) in notifications"
          :key="index"
          class="mb-4 grid grid-cols-[25px_minmax(0,1fr)] items-start pb-4 last:mb-0 last:pb-0"
        >
          <component
            :is="notification.icon"
            class="h-5 w-5 text-muted-foreground"
          />

          <div class="space-y-1 text-left pl-2">
            <p class="text-sm font-medium leading-none">
              {{ notification.title }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ notification.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex w-full justify-center h-full items-center"
      v-if="isSearching"
    >
      <Spinner :size="60" :color="'#ff1d5e'" />
    </div>

    <template v-for="station in stations" :key="station.id">
      <div
        v-ripple
        class="flex items-center justify-between p-2 hover:bg-muted rounded-md"
        :class="{
          'pointer-events-none bg-muted': isSearching,
        }"
        @click="() => goToStationStream(station.mount_point)"
      >
        <div class="flex flex-col items-start">
          <span>
            {{ station.name }}
          </span>
          <span class="text-sm text-muted-foreground">
            {{ station.mount_point }}
          </span>
          <span class="text-sm text-muted-foreground"> Now playing: TODO </span>
        </div>
      </div>

      <Separator
        v-if="stations && station !== stations[stations.length - 1]"
        class="my-2"
      />
    </template>
  </ScrollArea>

  <div class="mt-2">
    <Input
      class="text-white"
      placeholder="Type to search other stations..."
      @input="(e: Event) => debouncedSearch(e)"
    >
      Your station
    </Input>

    <div class="flex flex-col gap-2 mt-5 items-center">
      <Button class="w-4/6" @click="goToUserStaion" variant="outline"
        >Your station</Button
      >
      <!-- <Button class="w-4/6" variant="secondary">Invite friend</Button> -->
    </div>
  </div>
</template>

<style scoped></style>
