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
import { Bell, Check } from 'lucide-vue-next'
import { cn } from '@/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const SEARCH_STATION_API_URL = "/api/v1/stations/search";

const userStore = useUserStore();
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
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];
</script>

<template>
  <ScrollArea class="h-[80%] w-full rounded-md border p-4 mt-5">
    <div v-if="!isSearching && lastSearchQuery === ''">

      <Card :class="cn('w-[380px]', $attrs.class ?? '')">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have 3 unread messages.</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4">
          <div class="flex items-center space-x-4 rounded-md border p-4">
            <Bell />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">Push Notifications</p>
              <p class="text-sm text-muted-foreground">
                Send notifications to device.
              </p>
            </div>
            <Switch />
          </div>
          <div>
            <div
              v-for="(notification, index) in notifications"
              :key="index"
              class="mb-4 grid grid-cols-[25px_minmax(0,1fr)] items-start pb-4 last:mb-0 last:pb-0"
            >
              <span
                class="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500"
              />
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ notification.description }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button class="w-full">
            <Check class="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </CardFooter>
      </Card>

    </div>

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
