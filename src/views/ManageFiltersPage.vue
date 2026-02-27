<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/filters-labels"></ion-back-button>
        </ion-buttons>
        <ion-title>Manage filters</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="filtersList.length === 0" class="text-center text-gray-400 mt-10">
        No filters to manage
      </div>

      <ion-list lines="none">
        <ion-item button v-for="filter in filtersList" :key="filter.id" @click="openMenu(filter)">
          <ion-icon slot="start" :icon="funnelOutline" :color="filter.color || 'primary'"></ion-icon>
          <ion-label>{{ filter.name }}</ion-label>
          <ion-icon v-if="filter.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonButtons, 
  IonBackButton, actionSheetController 
} from '@ionic/vue';
import { funnelOutline, heart, trashOutline, createOutline, closeOutline } from 'ionicons/icons';

import { db, auth, collection, query, where, onSnapshot, doc, deleteDoc } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const filtersList = ref<any[]>([]);
let unsubscribe: any = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(collection(db, 'filters'), where('userId', '==', user.uid));
      if (unsubscribe) unsubscribe();
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        filtersList.value = data;
      });
    } else {
      filtersList.value = [];
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const openMenu = async (filter: any) => {
  const actionSheet = await actionSheetController.create({
    header: `Manage: ${filter.name}`,
    buttons: [
      {
        text: 'Edit',
        icon: createOutline,
        handler: () => {
          router.push(`/edit-filter/${filter.id}`); 
        },
      },
      {
        text: 'Delete',
        role: 'destructive',
        icon: trashOutline,
        handler: () => {
          deleteFilter(filter.id);
        },
      },
      {
        text: 'Cancel',
        icon: closeOutline,
        role: 'cancel',
      },
    ],
  });

  await actionSheet.present();
};

const deleteFilter = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'filters', id));
  } catch (error) {
    console.error("Error deleting filter: ", error);
    alert("ไม่สามารถลบข้อมูลได้");
  }
};
</script>