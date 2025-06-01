<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import type { Station } from "@/models/station.model";
import _axios from "@/services/axios";
import { ref } from "vue";
import { toast } from "vue-sonner";

const props = defineProps<{ station: Station }>();

const [showAlertDialog, pendingSwitch] = [ref(false), ref(false)];

const switchInput = ref<HTMLInputElement | null>(null);

const handleClick = async (event: MouseEvent) => {
  event.preventDefault();
  event.stopImmediatePropagation();

  if (props.station.is_live) {
    pendingSwitch.value = true;
    showAlertDialog.value = true;
  } else {
    const playlists = props.station.playlists || [];

    if (playlists.length === 0) {
      toast.error("You need to add a playlist before spinning up the station.");
      return;
    }

    if (playlists.every((playlists) => playlists.songs?.length === 0)) {
      toast.error(
        "You need to add songs to the playlist before spinning up the station."
      );
      return;
    }

    await spinUpStation(props.station.id);
  }
};

const confirmChange = async () => {
  showAlertDialog.value = false;

  if (pendingSwitch.value) {
    await spinDownStaion(props.station.id);
    pendingSwitch.value = false;
  }
};

const cancelChange = () => {
  showAlertDialog.value = false;
  pendingSwitch.value = false;
};

const spinDownStaion = async (stationId: number) => {
  try {
    await _axios.post(`api/v1/stations/${stationId}/spin/down`, { stationId });

    emit("switch-toggled", false);
  } catch (error) {
    toast.error(
      "An error occurred while trying to spin down the station. Please try again."
    );
  }
};

const spinUpStation = async (stationId: number) => {
  try {
    await _axios.post(`api/v1/stations/${stationId}/spin/up`, { stationId });

    emit("switch-toggled", true);
  } catch (error) {
    toast.error(
      "An error occurred while trying to spin up the station. Please try again."
    );
  }
};

const emit = defineEmits<{
  (e: "switch-toggled", isLive: boolean): void;
}>();
</script>

<template>
  <AlertDialog v-model:open="showAlertDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          Stopping the station will end the broadcast.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="cancelChange">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="confirmChange">Stop</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <label class="switch" @click="handleClick">
    <input
      ref="switchInput"
      type="checkbox"
      :checked="props.station.is_live"
      readonly
    />
    <span class="slider round"></span>
  </label>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #787878;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1rem;
  width: 1rem;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #282b2d;
}

input:focus + .slider {
  box-shadow: 0 0 1px #282b2d;
}

input:checked + .slider:before {
  -webkit-transform: translateX(36px);
  -ms-transform: translateX(36px);
  transform: translateX(36px);
  animation: colorWhirpool 1.5s ease-in-out infinite;
}

@keyframes colorWhirpool {
  0% {
    background-color: #da3016;
  }
  25% {
    background-color: #00ff2a;
  }
  50% {
    background-color: #290fec;
  }
  75% {
    background-color: #d9ff00;
  }
  100% {
    background-color: #da3016;
  }
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
