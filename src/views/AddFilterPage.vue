<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/filters-labels"></ion-back-button>
        </ion-buttons>
        <ion-title>Add filter</ion-title>
        <ion-buttons slot="end">
          <ion-button color="dark" @click="saveFilter" :disabled="!filterName.trim() || isSaving">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <ion-icon v-else slot="icon-only" :icon="checkmarkOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="mt-4">
        <ion-input 
          v-model="filterName"
          label="Name" 
          label-placement="stacked" 
          fill="outline" 
          class="custom-input"
          :maxlength="60"
        ></ion-input>
        <div class="text-right text-xs text-gray-500 mt-1 px-1">{{ filterName.length }}/60</div>
      </div>

      <ion-list lines="none" class="mt-4">
        <ion-item button @click="openColorPicker">
          <ion-icon slot="start" :icon="colorFillOutline" :color="selectedColor"></ion-icon>
          <ion-label>Color</ion-label>
          <ion-note slot="end" class="capitalize">{{ colorNameDisplay }}</ion-note>
        </ion-item>
        
        <ion-item button @click="isFavorite = !isFavorite">
          <ion-icon slot="start" :icon="isFavorite ? heart : heartOutline" :color="isFavorite ? 'danger' : ''"></ion-icon>
          <ion-label>Favorite</ion-label>
        </ion-item>
      </ion-list>

      <div class="mt-4">
        <ion-textarea 
          v-model="queryText"
          label="Query" 
          label-placement="stacked" 
          fill="outline" 
          :rows="3"
          class="custom-input"
          :maxlength="1024"
          placeholder="e.g. today & high"
        ></ion-textarea>
        <div class="flex justify-between text-xs mt-1 px-1">
          <!-- ✅ Live validation -->
          <div v-if="queryText.trim()">
            <span v-if="queryValidation.isValid" class="text-green-500 flex items-center gap-1">
              <ion-icon :icon="checkmarkCircleOutline" class="text-xs"></ion-icon>
              Valid: {{ queryValidation.description }}
            </span>
            <div v-else>
              <span v-for="err in queryValidation.errors" :key="err" class="text-red-400 flex items-center gap-1">
                <ion-icon :icon="alertCircleOutline" class="text-xs"></ion-icon>
                {{ err }}
              </span>
            </div>
          </div>
          <span v-else class="text-gray-400">Enter a query using keywords below</span>
          <span class="text-gray-500">{{ queryText.length }}/1024</span>
        </div>
      </div>

      <!-- ✅ Quick keyword chips -->
      <div class="mt-4 px-1">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Add Keywords</p>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="kw in quickKeywords" :key="kw.keyword"
            @click="insertKeyword(kw.keyword)"
            class="px-2.5 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
            :class="getKeywordBadgeClass(kw.type)">
            {{ kw.keyword }}
          </button>
        </div>
        <div class="flex gap-2 mt-2">
          <button @click="insertOperator('&')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 active:scale-95">
            & AND
          </button>
          <button @click="insertOperator('|')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 active:scale-95">
            | OR
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonIcon, IonInput, IonTextarea, IonList,
  IonItem, IonLabel, IonSpinner, IonNote, alertController,
} from '@ionic/vue';
import {
  checkmarkOutline, colorFillOutline, heartOutline, heart,
  checkmarkCircleOutline, alertCircleOutline,
} from 'ionicons/icons';

import { db, auth, collection, addDoc, Timestamp } from '@/services/firebase';
import { parseQuery, getKeywordSuggestions } from '@/services/filterEngine';

const router = useRouter();
const filterName = ref('');
const queryText = ref('');
const isFavorite = ref(false);
const isSaving = ref(false);
const selectedColor = ref('medium');

const colorNameDisplay = computed(() => {
  const map: Record<string, string> = {
    primary: 'Blue', secondary: 'Cyan', tertiary: 'Purple', 
    success: 'Green', warning: 'Yellow', danger: 'Red', medium: 'Gray'
  };
  return map[selectedColor.value] || 'Gray';
});

// ✅ Live query validation
const queryValidation = computed(() => parseQuery(queryText.value));

// ✅ Quick keyword chips
const quickKeywords = computed(() => getKeywordSuggestions().slice(0, 16));

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

function insertKeyword(kw: string) {
  if (queryText.value.trim() && !queryText.value.trim().endsWith('&') && !queryText.value.trim().endsWith('|')) {
    queryText.value = queryText.value.trim() + ' & ' + kw;
  } else {
    queryText.value = queryText.value.trim() ? queryText.value.trim() + ' ' + kw : kw;
  }
}

function insertOperator(op: string) {
  if (queryText.value.trim()) {
    queryText.value = queryText.value.trim() + ' ' + op + ' ';
  }
}

const openColorPicker = async () => {
  const alert = await alertController.create({
    header: 'Select Color',
    inputs: [
      { label: 'Blue', type: 'radio', value: 'primary', checked: selectedColor.value === 'primary' },
      { label: 'Cyan', type: 'radio', value: 'secondary', checked: selectedColor.value === 'secondary' },
      { label: 'Purple', type: 'radio', value: 'tertiary', checked: selectedColor.value === 'tertiary' },
      { label: 'Green', type: 'radio', value: 'success', checked: selectedColor.value === 'success' },
      { label: 'Yellow', type: 'radio', value: 'warning', checked: selectedColor.value === 'warning' },
      { label: 'Red', type: 'radio', value: 'danger', checked: selectedColor.value === 'danger' },
      { label: 'Gray', type: 'radio', value: 'medium', checked: selectedColor.value === 'medium' },
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'OK', handler: (value) => { if (value) selectedColor.value = value; } }
    ]
  });
  await alert.present();
};

const saveFilter = async () => {
  if (!filterName.value.trim() || !auth.currentUser) return;
  isSaving.value = true;
  try {
    await addDoc(collection(db, 'filters'), {
      name: filterName.value.trim(),
      query: queryText.value.trim(),
      isFavorite: isFavorite.value,
      color: selectedColor.value,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now()
    });
    router.back();
  } catch (error) {
    console.error("Error adding filter: ", error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.custom-input { --border-color: #fbd38d; --border-radius: 8px; }
</style>
