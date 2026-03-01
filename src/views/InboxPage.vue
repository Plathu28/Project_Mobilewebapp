<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding inbox-content">
      <div class="pb-28 px-4 pt-2">

        <header class="mb-8 mt-6 flex justify-between items-end">
          <div>
            <div class="flex items-baseline gap-3">
              <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Inbox</h1>
              <span class="text-xl font-bold text-gray-400">{{ currentDate }}</span>
            </div>
            <p class="text-gray-500 text-lg font-medium mt-1">
              You have {{ store.activeTasks.length }} tasks
            </p>
          </div>

          <div
            @click="router.push('/profile')"
            class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer active:scale-90 transition-transform flex-shrink-0"
          >
            <img
              :src="user?.photoURL || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + (user?.email || 'user')"
              alt="User"
              class="w-full h-full object-cover"
            />
          </div>
        </header>

        <section class="grid grid-cols-2 gap-4 mb-8">
          <div
            v-for="cat in categoryCards"
            :key="cat.name"
            :class="[
              'relative p-5 rounded-[2rem] h-36 flex flex-col justify-between shadow-sm transition-transform active:scale-95 cursor-pointer',
              cat.bgColor,
            ]"
            @click="scrollToCategory(cat.name)"
          >
            <div class="bg-white/40 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
              <ion-icon :icon="cat.ionIcon" class="text-xl text-gray-800"></ion-icon>
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ store.categoryCounts[cat.name] }}</p>
              <p class="text-sm font-semibold text-gray-800/70 mt-1">{{ cat.name }}</p>
            </div>
          </div>
        </section>

        <section>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-900">All Tasks</h3>
          </div>

          <div v-if="store.loading" class="flex justify-center py-12">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>

          <div v-else-if="store.activeTasks.length === 0" class="text-center py-16">
            <ion-icon :icon="checkmarkDoneCircleOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
            <p class="text-gray-400 text-lg font-medium">No tasks yet!</p>
            <p class="text-gray-400 text-sm mt-1">Tap + to add your first task</p>
          </div>

          <ion-list v-else lines="none" class="bg-transparent">
            <ion-item-sliding v-for="task in store.activeTasks" :key="task.id" @ionDrag="onDrag">
              <ion-item-options side="end">
                <ion-item-option color="danger" @click="handleDelete(task.id)" expandable>
                  <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>

              <ion-item class="task-item" @click="openEditTask(task.id)">
                <div class="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 w-full my-1">
                  <div
                    style="min-width: 28px; min-height: 28px;"
                    class="mt-1 w-7 h-7 bg-white rounded-full border-2 border-solid border-gray-400 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all active:scale-75 active:bg-green-100 group"
                    :class="getCategoryBorderColor(task.category)"
                    @click.stop="handleComplete(task.id)"
                  >
                    <ion-icon :icon="checkmark" class="text-transparent group-active:text-green-600 text-xl transition-colors"></ion-icon>
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="text-base font-bold text-gray-800 truncate">{{ task.title }}</p>

                    <div v-if="task.labels && task.labels.length > 0" class="flex flex-wrap gap-1 mt-1.5">
                      <span 
                        v-for="labelId in task.labels" 
                        :key="labelId"
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
                        :class="getLabelChipClass(getLabelInfo(labelId).color)"
                      >
                        <div 
                          class="w-1.5 h-1.5 rounded-full" 
                          :style="{ backgroundColor: IONIC_COLOR_HEX[getLabelInfo(labelId).color] || '#989aa2' }"
                        ></div>
                        {{ getLabelInfo(labelId).name }}
                      </span>
                    </div>

                    <div v-if="task.subtasks && task.subtasks.length > 0" class="mt-2 ml-2 space-y-1">
                      <div v-for="sub in task.subtasks" :key="sub.id" class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded border border-gray-300 flex items-center justify-center">
                          <ion-icon v-if="sub.completed" :icon="checkmark" class="text-xs text-green-500"></ion-icon>
                        </div>
                        <span class="text-sm text-gray-600" :class="{ 'line-through opacity-50': sub.completed }">{{ sub.title }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 mt-2">
                      <span class="inline-block px-2 py-0.5 rounded-md text-xs font-bold tracking-wide" :class="getCategoryBadgeClass(task.category)">
                        {{ task.category.toUpperCase() }}
                      </span>
                      <span v-if="task.date" class="text-xs text-gray-400">{{ formatDate(task.date) }}</span>
                      <span v-if="task.startTime" class="text-xs text-gray-400">{{ task.startTime }}</span>
                      <span v-if="task.routine" class="text-xs text-blue-400">
                        <ion-icon :icon="repeatOutline" class="text-xs"></ion-icon>
                      </span>
                    </div>
                  </div>
                </div>
              </ion-item>
            </ion-item-sliding>
          </ion-list>
        </section>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mb-2 mr-2">
        <ion-fab-button color="dark" router-link="/new-task">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import {
  IonPage, IonContent, IonList, IonItem, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
  IonSpinner, toastController,
} from '@ionic/vue';
import {
  add, trashOutline, heartOutline, briefcaseOutline,
  happyOutline, folderOutline, checkmarkDoneCircleOutline,
  checkmark, repeatOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useAuth } from '@/composables/useAuth';
import type { CategoryName } from '@/types/task';
import { useRouter } from 'vue-router';
// เพิ่มการนำเข้า Firebase tools
import { db, collection, query, where, onSnapshot } from '@/services/firebase';

const router = useRouter();
const store = useTaskStore();
const { user } = useAuth();

// --- Label State & Colors ---
const allLabels = ref<any[]>([]);
const IONIC_COLOR_HEX: Record<string, string> = {
  primary: '#3880ff', secondary: '#0cd1e8', tertiary: '#7044ff',
  success: '#10dc60', warning: '#ffce00', danger: '#f04141', medium: '#989aa2',
};

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric',
});

const categoryCards = [
  { name: 'Health' as CategoryName, bgColor: 'bg-cyan-200', ionIcon: heartOutline },
  { name: 'Work' as CategoryName, bgColor: 'bg-green-200', ionIcon: briefcaseOutline },
  { name: 'Mental Health' as CategoryName, bgColor: 'bg-purple-200', ionIcon: happyOutline },
  { name: 'Others' as CategoryName, bgColor: 'bg-amber-200', ionIcon: folderOutline },
];

// --- Lifecycle ---
onMounted(() => {
  // ดึงข้อมูล Labels ทั้งหมดของผู้ใช้มาเก็บไว้เทียบชื่อ
  if (user.value) {
    const q = query(collection(db, 'labels'), where('userId', '==', user.value.uid));
    onSnapshot(q, (snapshot) => {
      allLabels.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }
});

// --- Helper Functions ---
function getLabelInfo(labelId: string) {
  const found = allLabels.value.find(l => l.id === labelId);
  return found || { name: 'Label', color: 'medium' };
}

function getLabelChipClass(color: string): string {
  const map: Record<string, string> = {
    primary: 'bg-blue-50 text-blue-600 border-blue-100',
    secondary: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    tertiary: 'bg-purple-50 text-purple-600 border-purple-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
    medium: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return map[color] || 'bg-gray-50 text-gray-600 border-gray-100';
}

function getCategoryBorderColor(cat: CategoryName) {
  const map: Record<CategoryName, string> = {
    Health: 'border-cyan-400', Work: 'border-green-400',
    'Mental Health': 'border-purple-400', Others: 'border-amber-400',
  };
  return map[cat] || 'border-gray-300';
}

function getCategoryBadgeClass(cat: CategoryName) {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-100 text-cyan-700', Work: 'bg-green-100 text-green-700',
    'Mental Health': 'bg-purple-100 text-purple-700', Others: 'bg-amber-100 text-amber-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function openEditTask(taskId: string) {
  router.push(`/edit-task/${taskId}`);
}

async function handleComplete(taskId: string) {
  // 1. เปลี่ยนสถานะเป็นเสร็จสิ้น
  await store.toggleComplete(taskId);

  // 2. สร้าง Toast พร้อมปุ่ม Undo
  const toast = await toastController.create({
    message: '✅ Task completed!',
    duration: 3000, // เพิ่มเวลาเป็น 3 วินาทีเพื่อให้ผู้ใช้มีเวลาสังเกตและกด Undo
    position: 'bottom',
    color: 'success',
    cssClass: 'custom-undo-toast', // สามารถเอาไปแต่ง style เพิ่มได้
    buttons: [
      {
        text: 'Undo',
        role: 'cancel', // ใส่ role เพื่อให้ดูเด่นหรือจัดการพฤติกรรมพื้นฐาน
        handler: async () => {
          // 3. เมื่อกด Undo ให้เรียก toggle อีกรอบเพื่อดึงงานกลับมา
          await store.toggleComplete(taskId);
          
          // ตัวเลือกเสริม: แจ้งเตือนว่าดึงงานกลับมาแล้ว
          const undoToast = await toastController.create({
            message: 'Task restored',
            duration: 1000,
            position: 'bottom',
            color: 'medium'
          });
          await undoToast.present();
        }
      }
    ]
  });

  await toast.present();
}

async function handleDelete(taskId: string) {
  await store.deleteTask(taskId);
  const toast = await toastController.create({ message: '🗑️ Task deleted', duration: 1500, position: 'bottom', color: 'danger' });
  await toast.present();
}

function scrollToCategory(_name: CategoryName) {}
function onDrag(_ev: any) {}
</script>

<style scoped>
.inbox-content { --background: #f9fafb; }
.task-item {
  --background: transparent;
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
}
ion-item-sliding { margin-bottom: 4px; }
</style>