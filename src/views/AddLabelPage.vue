<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/filters-labels"></ion-back-button>
        </ion-buttons>
        <ion-title>Add label</ion-title>
        <ion-buttons slot="end">
          <ion-button color="dark" @click="saveLabel" :disabled="!labelName.trim() || isSaving">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <ion-icon v-else slot="icon-only" :icon="checkmarkOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="mt-4">
        <ion-input 
          v-model="labelName"
          label="Name" 
          label-placement="stacked" 
          fill="outline" 
          class="custom-input"
          :maxlength="60"
        ></ion-input>
        <div class="text-right text-xs text-gray-500 mt-1 px-1">{{ labelName.length }}/60</div>
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// ✅ นำเข้า alertController เพิ่มเข้ามา
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonInput, IonList, IonItem, IonLabel, IonSpinner, IonNote, alertController } from '@ionic/vue';
import { checkmarkOutline, colorFillOutline, heartOutline, heart } from 'ionicons/icons';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

const router = useRouter();
const labelName = ref('');
const isFavorite = ref(false);
const isSaving = ref(false);

// ✅ ตัวแปรเก็บสีที่เลือก (ค่าเริ่มต้นเป็นสีเทา medium)
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

const saveLabel = async () => {
  if (!labelName.value.trim() || !auth.currentUser) return;
  isSaving.value = true;
  try {
    await addDoc(collection(db, 'labels'), {
      name: labelName.value.trim(),
      isFavorite: isFavorite.value,
      color: selectedColor.value, // ✅ อย่าลืมบันทึกสีลง Firebase!
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    router.back();
  } catch (error) {
    console.error("Error adding document: ", error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.custom-input { --border-color: #fbd38d; --border-radius: 8px; }
</style>