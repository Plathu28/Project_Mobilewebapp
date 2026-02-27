<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/manage-filters"></ion-back-button>
        </ion-buttons>
        <ion-title>Edit filter</ion-title>
        <ion-buttons slot="end">
          <ion-button color="dark" @click="updateFilter" :disabled="!filterName.trim() || isSaving">
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonInput, IonTextarea, IonList, IonItem, IonLabel, IonSpinner, alertController } from '@ionic/vue';
import { checkmarkOutline, colorFillOutline, heartOutline, heart } from 'ionicons/icons';

// นำเข้า Firebase
import { db, doc, getDocs, updateDoc } from '@/services/firebase';
import { getDoc } from 'firebase/firestore';

const route = useRoute();
const router = useRouter();

// รับ ID ของ Filter ที่ส่งมาทาง URL
const filterId = route.params.id as string;
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
const filterName = ref('');
const queryText = ref('');
const isFavorite = ref(false);
const isSaving = ref(false);

// ดึงข้อมูลเดิมมาแสดงตอนเปิดหน้า
onMounted(async () => {
  if (filterId) {
    const docRef = doc(db, 'filters', filterId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      filterName.value = data.name || '';
      queryText.value = data.query || '';
      isFavorite.value = data.isFavorite || false;
    }
  }
});

// ฟังก์ชันบันทึกการแก้ไข
const updateFilter = async () => {
  if (!filterName.value.trim()) return;
  isSaving.value = true;
  try {
    const docRef = doc(db, 'filters', filterId);
    await updateDoc(docRef, {
      name: filterName.value.trim(),
      query: queryText.value.trim(),
      color: selectedColor.value,
      isFavorite: isFavorite.value
    });
    router.back(); // กลับไปหน้าก่อนหน้า
  } catch (error) {
    console.error("Error updating filter: ", error);
    alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
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