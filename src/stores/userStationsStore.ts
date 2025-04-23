import type { Station } from "@/models/station.model";
import { defineStore } from "pinia";

export const useUserStationsStore = defineStore("userStations", {
    state: () => ({ stations: [] as Array<Station> }),
    actions: {
        toggleStationIsLive(station: Station) {
            this.stations = this.stations.map(
                s => s.id === station.id
                    ? { ...s, is_live: !s.is_live }
                    : s
            );
        },
        setStations(stations: Array<Station>) {
            this.stations = stations;
        },
        addStation(station: Station) {
            this.stations = [...this.stations, station];
        },
        removeStation(station: Station | number) {
            const stationId = typeof station === "number" ? station : station.id;

            this.stations = this.stations.filter(s => s.id !== stationId);
        },
    }
});