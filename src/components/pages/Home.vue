<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/userStore";
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

const SEARCH_STATION_API_URL = "/api/v1/stations/search";

const userStore = useUserStore();
const router = useRouter();

const goToUserStaion = () => {
  router.push({ name: RouteNames.USER_STATION });
};

const stations = ref<Station[]>([]);
const isSearching = ref(false);

const debouncedSearch = useDebounceFn(async (value: Event) => {
  const input = value.target as HTMLInputElement;
  const query = input.value;

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
</script>

<template>
  <div class="flex justify-center items-center gap-2 w-full">
    <Avatar>
      <AvatarImage src="https://github.com/unovue.png" alt="@unovue" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>

    Hey {{ userStore.name }} 👋
  </div>

  <ScrollArea class="h-[50vh] w-full rounded-md border p-4 mt-18">
    <div
      class="flex w-full justify-center h-[45vh] items-center"
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

  <div class="mt-10">
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
