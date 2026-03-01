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
          <ion-label>
            <h2>{{ filter.name }}</h2>
            <!-- ✅ Show query with validation status -->
            <div v-if="filter.query" class="mt-1">
              <p class="text-xs font-mono" :class="getQueryClass(filter.query)">
                {{ filter.query }}
              </p>
              <div v-if="!isQueryValid(filter.query)" class="mt-1">
                <p v-for="err in getQueryErrors(filter.query)" :key="err"
                  class="text-xs text-red-400 flex items-center gap-1">
                  <ion-icon :icon="alertCircleOutline" class="text-xs"></ion-icon>
                  {{ err }}
                </p>
              </div>
              <p v-else class="text-xs text-green-500 flex items-center gap-1 mt-0.5">
                <ion-icon :icon="checkmarkCircleOutline" class="text-xs"></ion-icon>
                Valid query
              </p>
            </div>
            <p v-else class="text-xs text-gray-400 mt-1">No query set</p>
          </ion-label>
          <ion-icon v-if="filter.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
        </ion-item>
      </ion-list>

      <!-- ✅ Available Keywords Reference -->
      <div class="mt-8 px-2">
        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Available Keywords</h3>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div v-for="group in keywordGroups" :key="group.type">
            <p class="text-xs font-bold text-gray-400 uppercase mb-1.5">{{ group.type }}</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="kw in group.keywords" :key="kw.keyword"
                class="px-2 py-1 rounded-lg text-xs font-mono"
                :class="getKeywordBadgeClass(group.type)">
                {{ kw.keyword }}
              </span>
            </div>
          </div>
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase mb-1.5">Combinators</p>
            <div class="flex gap-2">
              <span class="px-2 py-1 rounded-lg text-xs font-mono bg-gray-100 text-gray-600">&  (AND)</span>
              <span class="px-2 py-1 rounded-lg text-xs font-mono bg-gray-100 text-gray-600">|  (OR)</span>
            </div>
          </div>
          <p class="text-xs text-gray-400">Example: <span class="font-mono">today & high</span> → tasks due today with high priority</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonButtons, 
  IonBackButton, actionSheetController 
} from '@ionic/vue';
import {
  funnelOutline, heart, trashOutline, createOutline, closeOutline,
  checkmarkCircleOutline, alertCircleOutline,
} from 'ionicons/icons';

import { db, auth, collection, query, where, onSnapshot, doc, deleteDoc } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { parseQuery, getKeywordSuggestions } from '@/services/filterEngine';

const router = useRouter();
const filtersList = ref<any[]>([]);
let unsubscribe: any = null;

// ---- Query validation helpers ----
function isQueryValid(queryStr: string): boolean {
  return parseQuery(queryStr).isValid;
}

function getQueryErrors(queryStr: string): string[] {
  return parseQuery(queryStr).errors;
}

function getQueryClass(queryStr: string): string {
  return isQueryValid(queryStr) ? 'text-green-600' : 'text-red-500';
}

// ---- Keyword groups for reference ----
const keywordGroups = computed(() => {
  const suggestions = getKeywordSuggestions();
  const groups: Record<string, typeof suggestions> = {};
  suggestions.forEach((s) => {
    if (!groups[s.type]) groups[s.type] = [];
    groups[s.type].push(s);
  });
  return Object.entries(groups).map(([type, keywords]) => ({ type, keywords }));
});

function getKeywordBadgeClass(type: string): string {
  const map: Record<string, string> = {
    date: 'bg-blue-50 text-blue-600',
    category: 'bg-green-50 text-green-600',
    priority: 'bg-red-50 text-red-600',
    routine: 'bg-purple-50 text-purple-600',
    status: 'bg-amber-50 text-amber-600',
  };
  return map[type] || 'bg-gray-50 text-gray-600';
}

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
        text: 'View Results',
        icon: funnelOutline,
        handler: () => { router.push(`/filter/${filter.id}`); },
      },
      {
        text: 'Edit',
        icon: createOutline,
        handler: () => { router.push(`/edit-filter/${filter.id}`); },
      },
      {
        text: 'Delete',
        role: 'destructive',
        icon: trashOutline,
        handler: () => { deleteFilter(filter.id); },
      },
      { text: 'Cancel', icon: closeOutline, role: 'cancel' },
    ],
  });
  await actionSheet.present();
};

const deleteFilter = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'filters', id));
  } catch (error) {
    console.error("Error deleting filter: ", error);
  }
};
</script>
