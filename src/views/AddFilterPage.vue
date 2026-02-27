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
          :rows="4"
          class="custom-input"
          :maxlength="1024"
        ></ion-textarea>
        <div class="text-right text-xs text-gray-500 mt-1 px-1">{{ queryText.length }}/1024</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonInput, IonTextarea, IonList, IonItem, IonLabel, IonSpinner, alertController } from '@ionic/vue';
import { checkmarkOutline, colorFillOutline, heartOutline, heart } from 'ionicons/icons';

// ใช้ฟังก์ชันที่คุณ Export ไว้แล้วจาก firebase.ts
import { db, auth, collection, addDoc, Timestamp } from '@/services/firebase';
const selectedColor = ref('medium');
// คำนวณชื่อสีเพื่อเอาไปแสดงผลให้สวยๆ
const colorNameDisplay = computed(() => {
  const map: Record<string, string> = {
    primary: 'Blue', secondary: 'Cyan', tertiary: 'Purple', 
    success: 'Green', warning: 'Yellow', danger: 'Red', medium: 'Gray'
  };
  return map[selectedColor.value] || 'Gray';
});


// ✅ ฟังก์ชันเปิดป๊อปอัปเลือกสี
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
const router = useRouter();
const filterName = ref('');
const queryText = ref('');
const isFavorite = ref(false);
const isSaving = ref(false);

const saveFilter = async () => {
  if (!filterName.value.trim() || !auth.currentUser) return;
  
  isSaving.value = true;
  try {
    // บันทึกข้อมูลลง Collection 'filters'
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
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.custom-input {
  --border-color: #fbd38d;
  --border-radius: 8px;
}
</style>