<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Filters & Labels</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex justify-between items-center px-4">
        <h2 class="text-lg font-semibold">My filters</h2>
        <ion-button fill="clear" color="dark" router-link="/add-filter">
          <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
        </ion-button>
      </div>
      
      <ion-list lines="none">
        <ion-item button v-for="filter in filtersList" :key="filter.id">
          <ion-icon slot="start" :icon="funnelOutline" :color="filter.color || 'primary'"></ion-icon>
          <ion-label>{{ filter.name }}</ion-label>
          <ion-icon v-if="filter.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
        </ion-item>

        <ion-item v-if="filtersList.length === 0">
          <ion-label class="text-gray-400 text-sm">No filters found</ion-label>
        </ion-item>

        <ion-item button router-link="/manage-filters">
          <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
          <ion-label>Manage filters</ion-label>
        </ion-item>
      </ion-list>

      <div class="flex justify-between items-center px-4 mt-6">
        <h2 class="text-lg font-semibold">Labels</h2>
        <ion-button fill="clear" color="dark" router-link="/add-label">
          <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
        </ion-button>
      </div>
      
      <ion-list lines="none">
        <ion-item button v-for="label in labelsList" :key="label.id">
          <ion-icon slot="start" :icon="pricetagOutline" :color="label.color || 'medium'"></ion-icon>
          <ion-label>{{ label.name }}</ion-label>
          <ion-icon v-if="label.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
        </ion-item>

        <ion-item v-if="labelsList.length === 0">
          <ion-label class="text-gray-400 text-sm">No labels found</ion-label>
        </ion-item>

        <ion-item button router-link="/manage-labels">
          <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
          <ion-label>Manage labels</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonButtons, IonBackButton, IonButton } from '@ionic/vue';
import { addOutline, funnelOutline, settingsOutline, pricetagOutline, heart } from 'ionicons/icons';

// นำเข้า Firebase functions
import { db, auth, collection, query, where, onSnapshot } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const filtersList = ref<any[]>([]);
const labelsList = ref<any[]>([]);
let unsubscribeFilters: any = null;
let unsubscribeLabels: any = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;

      if (unsubscribeFilters) unsubscribeFilters();
      if (unsubscribeLabels) unsubscribeLabels();

      // 1. ดึงข้อมูล Filters
      const qFilters = query(collection(db, 'filters'), where('userId', '==', userId));
      unsubscribeFilters = onSnapshot(qFilters, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // เรียงลำดับตามเวลาด้วย JS กันบั๊ก Index ของ Firebase
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        filtersList.value = data;
      });

      // 2. ดึงข้อมูล Labels
      const qLabels = query(collection(db, 'labels'), where('userId', '==', userId));
      unsubscribeLabels = onSnapshot(qLabels, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // เรียงลำดับตามเวลาด้วย JS กันบั๊ก Index ของ Firebase
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        labelsList.value = data;
      });
    } else {
      filtersList.value = [];
      labelsList.value = [];
    }
  });
});

onUnmounted(() => {
  if (unsubscribeFilters) unsubscribeFilters();
  if (unsubscribeLabels) unsubscribeLabels();
});
</script>