<script setup lang="ts">
import type { Station } from "@/models/station.model";
import { computed, ref } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ListMusic, RadioTower, Pencil, Trash2 } from "lucide-vue-next";
import RadioSwitch from "@/components/ui/radio-switch/RadioSwitch.vue";
import TextMarquee from "@/components/ui/text-marquee/TextMarquee.vue";
import { Button } from "@/components/ui/button";
import { RouteNames } from "@/constants/route-names";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import _axios from "@/services/axios";
import { toast } from "vue-sonner";
import { useUserStationsStore } from "@/stores/userStationsStore";

const STATION_URL = "/api/v1/stations";

const props = defineProps<{ station: Station }>();

const expandedDescriptions = ref<Record<string, boolean>>({});
const isDeleting = ref(false);

const store = useUserStationsStore();

const toggleDescription = (stationId: string | number) => {
  expandedDescriptions.value[stationId] =
    !expandedDescriptions.value[stationId];
};

const playingPlaylist = computed(() =>
  props.station.playlists?.find((playlist) => playlist.pivot.is_playing)
);

const handleStationDelete = async (stationId: number) => {
  if (!store.stations.length) return;

  isDeleting.value = true;

  try {
    await _axios.delete(`${STATION_URL}/${stationId}`);

    store.removeStation(stationId);
  } catch (error) {
    toast.error("An error occurred while deleting the station.");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <Card :key="station.id" class="mb-4" :class="{ 'opacity-50': isDeleting }">
    <div class="flex items-center justify-end gap-3 mx-2">
      <Button
        variant="outline"
        size="icon"
        @click="
          $router.push({
            name: RouteNames.EDIT_STATION,
            params: { id: station.id },
          })
        "
      >
        <Pencil :size="15" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button variant="destructive" size="icon" style="background: #ad2e24">
            <Trash2 :size="15" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete station
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              class="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
              type="button"
              @click="() => handleStationDelete(station.id)"
            >
              <span> Continue </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

    <CardTitle>{{ station.name }}</CardTitle>
    <CardDescription
      v-if="station.description"
      :class="[
        expandedDescriptions[station.id] ? '' : 'line-clamp-2',
        'cursor-pointer',
        'px-2',
      ]"
      @click="toggleDescription(station.id)"
    >
      {{ station.description }}
      <span
        v-if="station.description && station.description.length > 50"
        class="text-xs text-muted-foreground ml-1"
      >
        {{ expandedDescriptions[station.id] ? "(Show less)" : "(Read more)" }}
      </span>
    </CardDescription>

    <CardContent>
      <div class="flex items-center space-x-4 rounded-md border p-4">
        <RadioTower />
        <div class="flex-1 space-y-1 text-left">
          <p class="text-sm font-medium leading-none">
            {{ station.is_live ? "Live" : "Offline" }}
          </p>
          <p class="text-sm text-muted-foreground">
            {{ station.is_live ? "Turn station off" : "Turn station on" }}
          </p>
        </div>

        <RadioSwitch :station="station" />
      </div>

      <div
        class="flex items-center space-x-4 rounded-md border p-4 mt-2"
        @click="
          $router.push({
            name: RouteNames.STATION_PLAYLISTS,
            params: { id: station.id },
          })
        "
      >
        <ListMusic />
        <div class="flex-col text-left w-full">
          <p class="text-sm font-medium leading-none">Playlists</p>
          <p class="text-sm text-muted-foreground flex items-center gap-3">
            Active:
            <TextMarquee
              :text="playingPlaylist?.name || 'No active'"
              :speed="10"
            />
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
