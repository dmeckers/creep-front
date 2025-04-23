<script setup lang="ts">
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-vue-next";

defineProps({
  error: {
    type: [String, null],
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div>
    <slot v-if="!error && !isLoading"></slot>

    <slot v-if="isLoading && !error" name="loader">
      <div class="w-full flex justify-center items-center h-full">
        <Spinner :size="60" :color="'#ff1d5e'" />
      </div>
    </slot>

    <slot name="error" v-if="error && !isLoading">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertCircle class="w-4 h-4" />
        <AlertDescription>
          {{ error || "Your session has expired. Please log in again." }}
        </AlertDescription>
      </Alert>
    </slot>
  </div>
</template>
