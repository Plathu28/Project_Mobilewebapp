<template>
  <ion-page>
    <ion-content :fullscreen="true" class="label-detail-content">
      <div class="pb-28">

        <div class="flex items-center px-4 pt-12 pb-4">
          <button @click="router.back()"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 mr-3 active:scale-90 transition-transform">
            <ion-icon :icon="arrowBack" class="text-gray-700 text-xl"></ion-icon>
          </button>
          <div class="flex items-center gap-2 flex-1">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: labelHex }"></div>
            <h1 class="text-2xl font-extrabold text-gray-900">{{ labelName }}</h1>
          </div>
          <span class="text-sm text-gray-400 font-medium">{{ tasks.length }} tasks</span>
        </div>

        <div v-if="tasks.length === 0" class="flex flex-col items-center justify-center mt-24 px-8 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ion-icon :icon="pricetagOutline" class="text-4xl text-gray-300"></ion-icon>
          </div>
          <p class="text-gray-400 text-base font-medium">No tasks with this label</p>
          <p class="text-gray-300 text-sm mt-1">Add this label to tasks to see them here</p>
        </div>

        <div v-else class="px-4 space-y-3">

          <div v-if="activeTasks.length > 0">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active</p>
            <div v-for="task in activeTasks" :key="task.id"
              class="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-start gap-3 mb-3">
              <button @click="store.toggleComplete(task.id)"
                class="mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                :style="{ borderColor: labelHex }">
              </button>
              <div class="flex-1 min-w-0">
                <p class="text-base font-semibold text-gray-800 leading-snug">{{ task.title }}</p>
                
                <div v-if="task.labels && task.labels.length > 0" class="flex flex-wrap gap-1 mt-1.5">
                  <span 
                    v-for="lId in task.labels" 
                    :key="lId"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
                    :class="getLabelChipClass(getLabelInfo(lId).color)"
                  >
                    <div 
                      class="w-1.5 h-1.5 rounded-full" 
                      :style="{ backgroundColor: IONIC_COLOR_HEX[getLabelInfo(lId).color] || '#989aa2' }"
                    ></div>
                    {{ getLabelInfo(lId).name }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase" :class="getCategoryClass(task.category)">
                    {{ task.category }}
                  </span>
                  <span v-if="task.date" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-500 uppercase">
                    {{ formatDate(task.date) }}
                  </span>
                  <span v-if="task.priority" class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                    :class="{
                      'bg-red-50 text-red-500': task.priority === 'high',
                      'bg-yellow-50 text-yellow-600': task.priority === 'medium',
                      'bg-gray-100 text-gray-500': task.priority === 'low',
                    }">
                    {{ task.priority }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="completedTasks.length > 0" class="mt-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Completed</p>
            <div v-for="task in completedTasks" :key="task.id"
              class="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-start gap-3 opacity-60 mb-3">
              <button @click="store.toggleComplete(task.id)"
                class="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                :style="{ backgroundColor: labelHex }">
                <ion-icon :icon="checkmark" class="text-white text-sm"></ion-icon>
              </button>
              <div class="flex-1 min-w-0">
                <p class="text-base font-semibold text-gray-400 line-through leading-snug">{{ task.title }}</p>
                
                <div v-if="task.labels && task.labels.length > 0" class="flex flex-wrap gap-1 mt-1.5">
                  <span 
                    v-for="lId in task.labels" 
                    :key="lId"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-100 bg-gray-50 text-gray-400 flex items-center gap-1"
                  >
                    {{ getLabelInfo(lId).name }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-400 uppercase">
                    {{ task.category }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import { arrowBack, pricetagOutline, checkmark } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { db, auth, collection, query, where, onSnapshot } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { CategoryName } from '@/types/task';

const router = useRouter();
const route = useRoute();
const store = useTaskStore();

const labelId = route.params.id as string;
const labelName = ref('');
const labelColor = ref('medium');
const allLabels = ref<any[]>([]); // สำหรับเก็บรายชื่อ labels ทั้งหมดเพื่อ Map ข้อมูล

const IONIC_COLOR_HEX: Record<string, string> = {
  primary: '#3880ff', secondary: '#0cd1e8', tertiary: '#7044ff',
  success: '#10dc60', warning: '#ffce00', danger: '#f04141', medium: '#989aa2',
};

const labelHex = computed(() => IONIC_COLOR_HEX[labelColor.value] ?? '#989aa2');

// โหลดข้อมูล labels
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    
    // ดึง labels ทั้งหมดเพื่อใช้ทำ Mapping ชื่อและสี
    const q = query(collection(db, 'labels'), where('userId', '==', user.uid));
    onSnapshot(q, (snapshot) => {
      allLabels.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // หาข้อมูลของ Label ปัจจุบันจากรายการที่ดึงมา
      const found = allLabels.value.find(d => d.id === labelId);
      if (found) {
        labelName.value = found.name;
        labelColor.value = found.color || 'medium';
      }
    });
  });
});

// --- Helper Functions ---

function getLabelInfo(lId: string) {
  const found = allLabels.value.find(l => l.id === lId);
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

// กรอง tasks ที่มี labelId นี้
const tasks = computed(() =>
  store.tasks.filter(t => t.labels?.includes(labelId))
);

const activeTasks = computed(() => tasks.value.filter(t => !t.completed));
const completedTasks = computed(() => tasks.value.filter(t => t.completed));

function getCategoryClass(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-50 text-cyan-600',
    Work: 'bg-green-50 text-green-600',
    'Mental Health': 'bg-purple-50 text-purple-600',
    Others: 'bg-amber-50 text-amber-600',
  };
  return map[cat] || 'bg-gray-100 text-gray-500';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
</script>

<style scoped>
.label-detail-content { --background: #f9fafb; }
</style>