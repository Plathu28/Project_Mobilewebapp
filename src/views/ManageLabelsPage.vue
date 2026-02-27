<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/filters-labels"></ion-back-button>
        </ion-buttons>
        <ion-title>Manage labels</ion-title>
        <ion-buttons slot="end">
          <ion-button color="dark" router-link="/add-label">
            <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="labelsList.length === 0" class="text-center text-gray-400 mt-10">
        No labels to manage
      </div>

      <ion-list lines="none">
        <ion-item button v-for="label in labelsList" :key="label.id" @click="openMenu(label)">
          <ion-icon slot="start" :icon="pricetagOutline" :color="label.color || 'medium'"></ion-icon>
          <ion-label>{{ label.name }}</ion-label>
          <ion-icon v-if="label.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
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
  IonBackButton, IonButton, actionSheetController 
} from '@ionic/vue';
import { addOutline, pricetagOutline, heart, trashOutline, createOutline, closeOutline } from 'ionicons/icons';

import { db, auth, collection, query, where, onSnapshot, doc, deleteDoc } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const labelsList = ref<any[]>([]);
let unsubscribe: any = null;

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(collection(db, 'labels'), where('userId', '==', user.uid));
      if (unsubscribe) unsubscribe();
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        labelsList.value = data;
      });
    } else {
      labelsList.value = [];
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const openMenu = async (labelItem: any) => {
  const actionSheet = await actionSheetController.create({
    header: `Manage: ${labelItem.name}`,
    buttons: [
      {
        text: 'Edit',
        icon: createOutline,
        handler: () => {
          router.push(`/edit-label/${labelItem.id}`);
        },
      },
      {
        text: 'Delete',
        role: 'destructive',
        icon: trashOutline,
        handler: () => {
          deleteLabel(labelItem.id);
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

const deleteLabel = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'labels', id));
  } catch (error) {
    console.error("Error deleting label: ", error);
    alert("ไม่สามารถลบข้อมูลได้");
  }
};
</script>