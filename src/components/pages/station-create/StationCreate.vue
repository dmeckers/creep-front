<script setup lang="ts">
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePostResource } from "@/composables/useResource";
import type { Station } from "@/models/station.model";
import { Loader2 } from "lucide-vue-next";
import { watch } from "vue";
import { toast } from "vue-sonner";
import router from "@/router";
import { RouteNames } from "@/constants/route-names";

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

const { data, error, isLoading, postData } =
  usePostResource<Station>("/api/v1/stations/");

const onSubmit = form.handleSubmit(async (values) => {
  await postData(values);

  router.push({name: RouteNames.USER_STATION});
});

watch(
  () => error.value,
  (error) => {
    toast(error || "An error occurred");
  }
);

watch(
  () => data.value,
  async (data) => {
    if (data) {
      toast.success("Station created successfully");

      router.push({ name: RouteNames.USER_STATION });
    }
  }
);
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    class="h-[65vh] flex flex-col justify-center"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem class="mt-6">
        <FormLabel>Station name *</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Enter station name"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage class="text-left" />
        <FormDescription class="text-xs text-left">
          This is the name of the station. It will be used to identify the
          station in the system.
        </FormDescription>
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem class="mt-6">
        <FormLabel>Station description</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Enter description"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage class="text-left" />
        <FormDescription class="text-xs text-left">
          Provide a brief description of the station. Maximum 200 characters.
        </FormDescription>
      </FormItem>
    </FormField>

    <Button class="mt-16" type="submit" :disabled="isLoading">
      <Loader2 class="w-4 h-4 mr-2 animate-spin" v-if="isLoading" />
      <span>Submit</span>
    </Button>
  </form>
</template>

<style scoped>
.station-create {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}
.station-create label {
  display: block;
  margin-bottom: 0.5rem;
}
.station-create input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  box-sizing: border-box;
}
.station-create button {
  padding: 0.5rem 1rem;
}
</style>
