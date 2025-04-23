<script setup lang="ts">
import { useTelegramAuth } from "@/composables/useTelegramAuth";
import Spinner from "@/components/ui/spinner/Spinner.vue";

const { isLoadingUser, error } = useTelegramAuth();

</script>

<template>
  <div>
    <p v-if="error && !isLoadingUser">
      <span style="color: red"></span>
    </p>

    <div class="spinner-container" v-if="!error && isLoadingUser">
      <Spinner :size="60" :color="'#ff1d5e'" />
    </div>
  </div>
</template>

<style scoped>
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
