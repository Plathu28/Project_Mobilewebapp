<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding upcoming-content">
      <div class="pb-28 px-4 pt-2">

        <header class="mb-6 mt-6">
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Upcoming</h1>
          <p class="text-gray-500 text-lg font-medium mt-1">
            {{ store.upcomingTasks.length }} upcoming tasks
          </p>
        </header>

        <div v-if="store.upcomingTasks.length === 0 && !store.loading" class="text-center py-16">
          <ion-icon :icon="rocketOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <p class="text-gray-400 text-lg font-medium">Nothing upcoming</p>
          <p class="text-gray-400 text-sm mt-1">Plan ahead by adding tasks with dates</p>
        </div>

        <div v-for="group in groupedTasks" :key="group.date" class="mb-6">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            {{ formatGroupDate(group.date) }}
          </h3>

          <ion-list lines="none" class="bg-transparent">
            <ion-item-sliding v-for="task in group.tasks" :key="task.id">
              <ion-item-options side="end">
                <ion-item-option color="danger" @click="handleDelete(task.id)" expandable>
                  <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>

              <ion-item class="task-item" @click="openEditTask(task.id)">
                <div class="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 w-full my-1">
                  <button
                    class="mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0"
                    :class="getCategoryBorderColor(task.category)"
                    @click.stop="handleComplete(task.id)"
                  ></button>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-sm truncate">{{ task.title }}</p>

                    <div v-if="task.labels && task.labels.length > 0" class="flex flex-wrap gap-1 mt-1">
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

                    <div class="flex items-center gap-2 mt-2">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                        :class="getCategoryBadgeClass(task.category)"
                      >{{ task.category.toUpperCase() }}</span>
                      <span v-if="task.startTime" class="text-[10px] text-gray-400 font-bold">{{ task.startTime }}</span>
                    </div>
                  </div>
                </div>
              </ion-item>
            </ion-item-sliding>
          </ion-list>
        </div>

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
  toastController,
} from '@ionic/vue';
import { add, trashOutline, rocketOutline } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useAuth } from '@/composables/useAuth'; // เพิ่ม useAuth
import { useRouter } from 'vue-router'; // เพิ่ม useRouter
import { db, collection, query, where, onSnapshot } from '@/services/firebase'; // เพิ่ม Firebase
import type { Task, CategoryName } from '@/types/task';

const store = useTaskStore();
const router = useRouter();
const { user } = useAuth();

// --- Label State & Colors ---
const allLabels = ref<any[]>([]);
const IONIC_COLOR_HEX: Record<string, string> = {
  primary: '#3880ff', secondary: '#0cd1e8', tertiary: '#7044ff',
  success: '#10dc60', warning: '#ffce00', danger: '#f04141', medium: '#989aa2',
};

interface TaskGroup {
  date: string;
  tasks: Task[];
}

const groupedTasks = computed<TaskGroup[]>(() => {
  const groups: Record<string, Task[]> = {};
  store.upcomingTasks.forEach((t) => {
    const d = t.date!;
    if (!groups[d]) groups[d] = [];
    groups[d].push(t);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tasks]) => ({ date, tasks }));
});

// --- Lifecycle ---
onMounted(() => {
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

function formatGroupDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getCategoryBorderColor(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'border-cyan-400', Work: 'border-green-400',
    'Mental Health': 'border-purple-400', Others: 'border-amber-400',
  };
  return map[cat] || 'border-gray-300';
}

function getCategoryBadgeClass(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-100 text-cyan-700', Work: 'bg-green-100 text-green-700',
    'Mental Health': 'bg-purple-100 text-purple-700', Others: 'bg-amber-100 text-amber-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}

function openEditTask(taskId: string) {
  router.push(`/edit-task/${taskId}`);
}

async function handleComplete(taskId: string) {
  await store.toggleComplete(taskId);
  const toast = await toastController.create({
    message: '✅ Task completed!', duration: 1500, position: 'bottom', color: 'success',
  });
  await toast.present();
}

async function handleDelete(taskId: string) {
  await store.deleteTask(taskId);
  const toast = await toastController.create({
    message: '🗑️ Task deleted', duration: 1500, position: 'bottom', color: 'danger',
  });
  await toast.present();
}
</script>

<style scoped>
.upcoming-content { --background: #f9fafb; }
.task-item { --background: transparent; --padding-start: 0; --padding-end: 0; --inner-padding-end: 0; }
</style>