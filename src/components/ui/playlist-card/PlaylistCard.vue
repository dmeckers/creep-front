<script setup lang="ts">
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash2, Disc } from "lucide-vue-next";
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
import type { Playlist } from "@/models/playlist.model";

defineProps<{
  playlist: Playlist;
}>();
</script>

<template>
  <Card :key="playlist.id" class="mb-4">
    <div class="flex items-center justify-end gap-3 mx-2">
      <Button
        variant="outline"
        size="icon"
        @click="
          $router.push({
            name: RouteNames.EDIT_PLAYLIST,
            params: { playlistId: playlist.id },
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
              @click="$emit('delete-station', playlist.id)"
            >
              <span> Continue </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

    <CardTitle>{{ playlist.name }}</CardTitle>

    <CardContent
      @click="
        $router.push({
          name: RouteNames.EDIT_PLAYLIST_SONGS,
          params: { playlistId: playlist.id },
        })
      "
    >
      <div class="flex items-center space-x-4 rounded-md border p-4">
        <Disc />
        <div class="flex-1 space-y-1 text-left">
          Songs
          <p class="text-sm text-muted-foreground">
            Total: {{ playlist.songs.length }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
