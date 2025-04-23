<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Station } from "@/models/station.model";
import ResourceWrapper from "@/components/ui/resource-wrapper/ResourceWrapper.vue";
import Label from "@/components/ui/label/Label.vue";
import Tumbleweed from "@/components/ui/tumbleweed/Tumbleweed.vue";
import StationCard from "@/components/ui/station-card/StationCard.vue";
import Button from "@/components/ui/button/Button.vue";
import _axios from "@/services/axios";
import { useUserStationsStore } from "@/stores/userStationsStore";

const GET_USER_STATION_URL = "/api/v1/user/stations";

const [isLoadingStations, loadError] = [ref(false), ref()];

const store = useUserStationsStore();

const fetchData = async () => {
  isLoadingStations.value = true;
  loadError.value = undefined;

  try {
    const r = await _axios.get<{ stations: Station[] }>(GET_USER_STATION_URL);
    store.stations = r.data.stations;
  } catch (error) {
    loadError.value = `${error}`;
  } finally {
    isLoadingStations.value = false;
  }
};

onMounted(() => fetchData());
</script>

<template>
  <ResourceWrapper
    :error="loadError"
    :isLoading="isLoadingStations"
    class="mt-6 h-full"
  >
    <StationCard
      v-for="station in store.stations"
      :station="station"
      :key="station.id"
    />

    <div v-if="store.stations.length === 0">
      <p class="text-xl font-semibold text-gray-700 mb-5">No stations</p>
      <Button
        @click="$router.push({ name: 'CreateOwnStation' })"
        class="cursor-pointer"
      >
        <Label> Create new station </Label>
      </Button>
      <Tumbleweed :size="50" />
    </div>
  </ResourceWrapper>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
