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

      <!-- ==================== FILTERS ==================== -->
      <div class="flex justify-between items-center px-4 mb-1">
        <h2 class="text-lg font-semibold">My filters</h2>
        <ion-button fill="clear" color="dark" router-link="/add-filter">
          <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
        </ion-button>
      </div>

      <ion-list lines="none">
        <ion-item-sliding v-for="filter in filtersList" :key="filter.id">
          <ion-item button @click="toggleFilterFavorite(filter)">
            <ion-icon slot="start" :icon="funnelOutline" :color="filter.color || 'primary'"></ion-icon>
            <ion-label>{{ filter.name }}</ion-label>
            <ion-icon v-if="filter.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
          </ion-item>
          <ion-item-options side="end">
            <!-- Toggle favorite -->
            <ion-item-option :color="filter.isFavorite ? 'medium' : 'warning'" @click="toggleFilterFavorite(filter)">
              <ion-icon slot="icon-only" :icon="filter.isFavorite ? heartDislike : heart"></ion-icon>
            </ion-item-option>
            <!-- Edit -->
            <ion-item-option color="primary" @click="openEditFilter(filter)">
              <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
            </ion-item-option>
            <!-- Delete -->
            <ion-item-option color="danger" @click="confirmDeleteFilter(filter.id)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item v-if="filtersList.length === 0">
          <ion-label class="text-gray-400 text-sm">No filters found</ion-label>
        </ion-item>

        <ion-item button router-link="/manage-filters">
          <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
          <ion-label>Manage filters</ion-label>
        </ion-item>
      </ion-list>

      <!-- ==================== LABELS ==================== -->
      <div class="flex justify-between items-center px-4 mt-6 mb-1">
        <h2 class="text-lg font-semibold">Labels</h2>
        <ion-button fill="clear" color="dark" router-link="/add-label">
          <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
        </ion-button>
      </div>

      <ion-list lines="none">
        <ion-item-sliding v-for="label in labelsList" :key="label.id">
          <ion-item button @click="router.push(`/label/${label.id}`)">
            <ion-icon slot="start" :icon="pricetagOutline" :color="label.color || 'medium'"></ion-icon>
            <ion-label>{{ label.name }}</ion-label>
            <ion-icon v-if="label.isFavorite" slot="end" :icon="heart" color="danger" size="small"></ion-icon>
          </ion-item>
          <ion-item-options side="end">
            <!-- Toggle favorite -->
            <ion-item-option :color="label.isFavorite ? 'medium' : 'warning'" @click="toggleLabelFavorite(label)">
              <ion-icon slot="icon-only" :icon="label.isFavorite ? heartDislike : heart"></ion-icon>
            </ion-item-option>
            <!-- Edit -->
            <ion-item-option color="primary" @click="openEditLabel(label)">
              <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
            </ion-item-option>
            <!-- Delete -->
            <ion-item-option color="danger" @click="confirmDeleteLabel(label.id)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <ion-item v-if="labelsList.length === 0">
          <ion-label class="text-gray-400 text-sm">No labels found</ion-label>
        </ion-item>

        <ion-item button router-link="/manage-labels">
          <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
          <ion-label>Manage labels</ion-label>
        </ion-item>
      </ion-list>

    </ion-content>

    <!-- ==================== EDIT LABEL MODAL ==================== -->
    <div v-if="editingLabel" class="fixed inset-0 z-50 flex items-end" @click.self="editingLabel = null">
      <div class="absolute inset-0 bg-black/30" @click="editingLabel = null"></div>
      <div class="relative w-full bg-white rounded-t-2xl shadow-xl z-10 pb-8 px-6 pt-4">
        <div class="flex justify-center mb-4"><div class="w-10 h-1 bg-gray-300 rounded-full"></div></div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">Edit Label</h3>
        <input v-model="editLabelName" placeholder="Label name..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 outline-none focus:border-blue-400 mb-4" />
        <p class="text-sm font-semibold text-gray-500 mb-3">Color</p>
        <div class="flex flex-wrap gap-2 mb-6">
          <button v-for="c in ionicColors" :key="c.value" @click="editLabelColor = c.value"
            class="w-8 h-8 rounded-full transition-transform active:scale-95"
            :class="editLabelColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''"
            :style="{ backgroundColor: c.hex }"></button>
        </div>
        <div class="flex gap-3">
          <button @click="editingLabel = null" class="flex-1 py-3 border border-gray-200 rounded-full text-base font-bold text-gray-600">Cancel</button>
          <button @click="saveEditLabel" :disabled="!editLabelName.trim()" class="flex-1 py-3 bg-gray-900 text-white rounded-full text-base font-bold disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>

    <!-- ==================== EDIT FILTER MODAL ==================== -->
    <div v-if="editingFilter" class="fixed inset-0 z-50 flex items-end" @click.self="editingFilter = null">
      <div class="absolute inset-0 bg-black/30" @click="editingFilter = null"></div>
      <div class="relative w-full bg-white rounded-t-2xl shadow-xl z-10 pb-8 px-6 pt-4">
        <div class="flex justify-center mb-4"><div class="w-10 h-1 bg-gray-300 rounded-full"></div></div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">Edit Filter</h3>
        <input v-model="editFilterName" placeholder="Filter name..."
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 outline-none focus:border-blue-400 mb-4" />
        <p class="text-sm font-semibold text-gray-500 mb-3">Color</p>
        <div class="flex flex-wrap gap-2 mb-6">
          <button v-for="c in ionicColors" :key="c.value" @click="editFilterColor = c.value"
            class="w-8 h-8 rounded-full transition-transform active:scale-95"
            :class="editFilterColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''"
            :style="{ backgroundColor: c.hex }"></button>
        </div>
        <div class="flex gap-3">
          <button @click="editingFilter = null" class="flex-1 py-3 border border-gray-200 rounded-full text-base font-bold text-gray-600">Cancel</button>
          <button @click="saveEditFilter" :disabled="!editFilterName.trim()" class="flex-1 py-3 bg-gray-900 text-white rounded-full text-base font-bold disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption,
  IonLabel, IonIcon, IonButtons, IonBackButton, IonButton,
  alertController, toastController,
} from '@ionic/vue';
import { addOutline, funnelOutline, settingsOutline, pricetagOutline, heart, heartDislike, trashOutline, createOutline } from 'ionicons/icons';
import { db, auth, collection, query, where, onSnapshot } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const filtersList = ref<any[]>([]);
const labelsList = ref<any[]>([]);
const router = useRouter();
let unsubscribeFilters: any = null;
let unsubscribeLabels: any = null;

// ---- Edit state ----
const editingLabel = ref<any>(null);
const editLabelName = ref('');
const editLabelColor = ref('medium');

const editingFilter = ref<any>(null);
const editFilterName = ref('');
const editFilterColor = ref('primary');

const ionicColors = [
  { value: 'primary',   hex: '#3880ff' },
  { value: 'secondary', hex: '#0cd1e8' },
  { value: 'tertiary',  hex: '#7044ff' },
  { value: 'success',   hex: '#10dc60' },
  { value: 'warning',   hex: '#ffce00' },
  { value: 'danger',    hex: '#f04141' },
  { value: 'medium',    hex: '#989aa2' },
];

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (unsubscribeFilters) unsubscribeFilters();
      if (unsubscribeLabels) unsubscribeLabels();

      const qFilters = query(collection(db, 'filters'), where('userId', '==', user.uid));
      unsubscribeFilters = onSnapshot(qFilters, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        filtersList.value = data;
      });

      const qLabels = query(collection(db, 'labels'), where('userId', '==', user.uid));
      unsubscribeLabels = onSnapshot(qLabels, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

// ==================== LABEL ACTIONS ====================

function openEditLabel(label: any) {
  editingLabel.value = label;
  editLabelName.value = label.name;
  editLabelColor.value = label.color || 'medium';
}

async function saveEditLabel() {
  if (!editingLabel.value || !editLabelName.value.trim()) return;
  await updateDoc(doc(db, 'labels', editingLabel.value.id), {
    name: editLabelName.value.trim(),
    color: editLabelColor.value,
  });
  const toast = await toastController.create({ message: '✅ Label updated', duration: 1500, position: 'bottom', color: 'success' });
  await toast.present();
  editingLabel.value = null;
}

async function toggleLabelFavorite(label: any) {
  await updateDoc(doc(db, 'labels', label.id), { isFavorite: !label.isFavorite });
}

async function confirmDeleteLabel(id: string) {
  const alert = await alertController.create({
    header: 'Delete Label',
    message: 'Are you sure you want to delete this label?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', role: 'destructive', handler: async () => {
        await deleteDoc(doc(db, 'labels', id));
        const toast = await toastController.create({ message: '🗑️ Label deleted', duration: 1500, position: 'bottom' });
        await toast.present();
      }},
    ],
  });
  await alert.present();
}

// ==================== FILTER ACTIONS ====================

function openEditFilter(filter: any) {
  editingFilter.value = filter;
  editFilterName.value = filter.name;
  editFilterColor.value = filter.color || 'primary';
}

async function saveEditFilter() {
  if (!editingFilter.value || !editFilterName.value.trim()) return;
  await updateDoc(doc(db, 'filters', editingFilter.value.id), {
    name: editFilterName.value.trim(),
    color: editFilterColor.value,
  });
  const toast = await toastController.create({ message: '✅ Filter updated', duration: 1500, position: 'bottom', color: 'success' });
  await toast.present();
  editingFilter.value = null;
}

async function toggleFilterFavorite(filter: any) {
  await updateDoc(doc(db, 'filters', filter.id), { isFavorite: !filter.isFavorite });
}

async function confirmDeleteFilter(id: string) {
  const alert = await alertController.create({
    header: 'Delete Filter',
    message: 'Are you sure you want to delete this filter?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', role: 'destructive', handler: async () => {
        await deleteDoc(doc(db, 'filters', id));
        const toast = await toastController.create({ message: '🗑️ Filter deleted', duration: 1500, position: 'bottom' });
        await toast.present();
      }},
    ],
  });
  await alert.present();
}
</script>