<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useTaskStore } from '@/stores/taskStore';

const store = useTaskStore();

onMounted(async () => {
  await store.initAuth();
});
</script>
