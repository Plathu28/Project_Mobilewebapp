<template>
  <ion-page>
    <ion-content :fullscreen="true" class="edit-task-content">
      <div class="flex flex-col h-full">

        <!-- Top bar -->
        <div class="flex items-center justify-between p-4">
          <button @click="goBack" class="w-10 h-10 flex items-center justify-center">
            <ion-icon :icon="arrowBack" class="text-2xl text-gray-500"></ion-icon>
          </button>
          <div class="flex items-center gap-2">
            <button @click="confirmDelete"
              class="w-10 h-10 flex items-center justify-center text-red-400 active:text-red-600">
              <ion-icon :icon="trashOutline" class="text-xl"></ion-icon>
            </button>
          </div>
        </div>

        <!-- Task Input -->
        <div class="flex-1 px-6 pt-2 overflow-y-auto">
          <textarea
            v-model="taskTitle"
            placeholder="Task name..."
            class="w-full text-2xl font-semibold text-gray-800 placeholder-gray-400 bg-transparent outline-none resize-none"
            rows="3"
          ></textarea>

          <!-- Subtasks -->
          <div v-if="subtasks.length > 0" class="mt-3 space-y-2">
            <div v-for="(sub, idx) in subtasks" :key="idx" class="flex items-center gap-3">
              <button
                class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                :class="sub.completed ? 'bg-green-400 border-green-400' : 'border-gray-300'"
                @click="sub.completed = !sub.completed"
              >
                <ion-icon v-if="sub.completed" :icon="checkmark" class="text-white text-[10px]"></ion-icon>
              </button>
              <input
                v-model="sub.title"
                class="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                :class="{ 'line-through text-gray-400': sub.completed }"
                placeholder="Subtask..."
              />
              <button @click="subtasks.splice(idx, 1)" class="text-gray-400">
                <ion-icon :icon="closeCircle" class="text-lg"></ion-icon>
              </button>
            </div>
          </div>

          <!-- Selected Labels -->
          <div v-if="selectedLabels.length > 0" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="label in selectedLabels"
              :key="label.id"
              class="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
              :class="getLabelChipClass(label.color)"
            >
              <ion-icon :icon="pricetagOutline" class="text-xs"></ion-icon>
              {{ label.name }}
              <button @click="removeLabel(label.id)" class="ml-0.5">
                <ion-icon :icon="closeCircle" class="text-xs opacity-60"></ion-icon>
              </button>
            </span>
          </div>

          <!-- Info chips -->
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="px-3 py-1.5 rounded-full text-sm font-semibold"
              :class="getCategoryChipClass(selectedCategory)">
              {{ selectedCategory }}
            </span>
            <span v-if="selectedDate" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {{ formatDateDisplay(selectedDate) }}
            </span>
            <span v-if="startTime" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
              {{ startTime }}{{ endTime ? ' - ' + endTime : '' }}
            </span>
            <span v-if="duration" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-teal-100 text-teal-700">
              {{ formatDuration(duration) }}
            </span>
            <span v-if="routineConfig" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-pink-100 text-pink-700">
              <ion-icon :icon="repeatOutline" class="text-xs mr-1"></ion-icon>
              {{ getRoutineLabel() }}
            </span>
            <span v-if="selectedPriority" class="px-3 py-1.5 rounded-full text-sm font-semibold"
              :class="{
                'bg-red-100 text-red-700': selectedPriority === 'high',
                'bg-yellow-100 text-yellow-700': selectedPriority === 'medium',
                'bg-gray-100 text-gray-600': selectedPriority === 'low',
              }">
              {{ selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1) }} Priority
            </span>
          </div>
        </div>

        <!-- Bottom Controls -->
        <div class="px-6 pb-6">
          <div class="flex items-center gap-3 mb-4">
            <button @click="openDateModal"
              class="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center">
              <ion-icon :icon="calendarOutline" class="text-xl"></ion-icon>
            </button>
            <button @click="saveTask" :disabled="!taskTitle.trim()"
              class="flex-1 h-12 bg-gray-900 text-white font-bold text-lg rounded-full disabled:opacity-40 transition-opacity active:scale-95">
              Save Changes
            </button>
          </div>

          <div class="flex items-center gap-3 relative">
            <button @click="showCategoryPicker = true"
              class="px-4 py-2.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 active:bg-gray-100">
              {{ selectedCategory }}
            </button>
            <button @click="showPriorityPicker = true"
              class="px-4 py-2.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 active:bg-gray-100">
              Priority
            </button>
            <div class="relative">
              <button @click="showMoreMenu = !showMoreMenu"
                class="px-3 py-2.5 border border-gray-200 rounded-full text-gray-500 active:bg-gray-100">
                <ion-icon :icon="ellipsisHorizontal" class="text-lg"></ion-icon>
              </button>
              <transition name="dropup">
                <div v-if="showMoreMenu"
                  class="absolute bottom-full mb-2 right-0 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden z-50 w-48">
                  <button @click="addSubtask(); showMoreMenu = false"
                    class="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors">
                    <ion-icon :icon="listOutline" class="text-lg text-gray-600"></ion-icon>
                    <span class="text-sm font-semibold text-gray-800">Add Subtask</span>
                  </button>
                  <div class="h-px bg-gray-100"></div>
                  <button @click="showLabelPicker = true; showMoreMenu = false"
                    class="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors">
                    <ion-icon :icon="pricetagOutline" class="text-lg text-gray-600"></ion-icon>
                    <span class="text-sm font-semibold text-gray-800">Add Label</span>
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showMoreMenu" class="fixed inset-0 z-40" @click="showMoreMenu = false"></div>

      <!-- ==========================================
           DATE MODAL
           ========================================== -->
      <ion-modal :is-open="showDateModal" @didDismiss="showDateModal = false" :initial-breakpoint="0.9" :breakpoints="[0, 0.9]">
        <div class="p-6 h-full overflow-y-auto">
          <div class="flex items-center gap-3 mb-6">
            <h2 class="text-3xl font-extrabold text-gray-900">Date</h2>
            <span class="text-2xl text-blue-400 font-semibold">
              {{ selectedDate ? formatDateDisplay(selectedDate) : 'None' }}
            </span>
          </div>

          <div class="space-y-1 mb-6">
            <button v-for="opt in quickDateOptions" :key="opt.label"
              class="flex justify-between items-center w-full py-3 px-1 text-left hover:bg-gray-50 rounded-lg"
              @click="selectQuickDate(opt.value)">
              <span class="text-base text-gray-800">{{ opt.label }}</span>
              <span class="text-sm text-gray-400">{{ opt.day }}</span>
            </button>
            <button class="flex justify-between items-center w-full py-3 px-1 text-left hover:bg-gray-50 rounded-lg"
              @click="clearDate">
              <span class="text-base text-gray-800">No date</span>
            </button>
          </div>

          <hr class="border-gray-200 mb-4" />

          <div class="mb-6">
            <div v-for="month in visibleMonths" :key="month.key" class="mb-4">
              <h3 class="text-base font-bold text-gray-700 mb-3">{{ month.label }}</h3>
              <div class="grid grid-cols-7 gap-1 mb-2">
                <span v-for="d in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="d"
                  class="text-center text-xs font-semibold text-gray-400">{{ d }}</span>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <div v-for="(day, i) in month.days" :key="i" class="aspect-square flex items-center justify-center">
                  <button v-if="day"
                    class="w-9 h-9 rounded-full text-sm font-medium transition-all"
                    :class="{
                      'bg-blue-400 text-white': isSelectedDay(month.year, month.month, day),
                      'text-gray-800 hover:bg-gray-100': !isSelectedDay(month.year, month.month, day),
                      'font-bold': isToday(month.year, month.month, day),
                    }"
                    @click="selectCalendarDate(month.year, month.month, day)">
                    {{ day }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr class="border-gray-200 mb-4" />

          <button @click="showTimeModal = true"
            class="flex items-center justify-between w-full py-4 text-left">
            <span class="text-base font-medium text-gray-800">Add time</span>
            <span v-if="startTime" class="text-sm text-blue-500">{{ startTime }}{{ endTime ? ' - ' + endTime : '' }}</span>
            <ion-icon v-else :icon="chevronForward" class="text-gray-400"></ion-icon>
          </button>

          <hr class="border-gray-200" />

          <button @click="showRoutineMenu = true"
            class="flex items-center justify-between w-full py-4 text-left">
            <span class="text-base font-medium text-gray-800">Routine</span>
            <span v-if="routineConfig" class="text-sm text-blue-500">{{ getRoutineLabel() }}</span>
            <ion-icon v-else :icon="chevronForward" class="text-gray-400"></ion-icon>
          </button>

          <hr class="border-gray-200 mb-4" />

          <button @click="showDateModal = false"
            class="w-full py-3.5 bg-gray-900 text-white font-bold text-lg rounded-full mt-4 active:scale-95 transition-transform">
            Save
          </button>
        </div>
      </ion-modal>

      <!-- TIME PICKER MODAL -->
      <ion-modal :is-open="showTimeModal" @didDismiss="showTimeModal = false" :initial-breakpoint="0.85" :breakpoints="[0, 0.85]">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-700 mb-6">select time</h3>
          <div class="flex gap-3 mb-6">
            <button @click="timeTab = 'start'"
              :class="['px-5 py-2 rounded-full text-sm font-bold transition-all',
                timeTab === 'start' ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-white' : 'bg-gray-100 text-gray-500']">
              Start</button>
            <button @click="timeTab = 'end'"
              :class="['px-5 py-2 rounded-full text-sm font-bold transition-all',
                timeTab === 'end' ? 'bg-gradient-to-r from-purple-300 to-blue-300 text-white' : 'bg-gray-100 text-gray-500']">
              End</button>
          </div>
          <div class="flex items-center gap-2 mb-8">
            <div class="flex items-center gap-1">
              <input :value="timeTab === 'start' ? tempStartHour : tempEndHour" @input="setHour($event)"
                type="number" min="1" max="12"
                class="w-20 h-20 text-center text-5xl font-bold bg-gradient-to-b from-blue-100 to-cyan-100 rounded-2xl outline-none" />
              <span class="text-5xl font-bold text-gray-800">:</span>
              <input :value="timeTab === 'start' ? tempStartMin : tempEndMin" @input="setMinute($event)"
                type="number" min="0" max="59"
                class="w-20 h-20 text-center text-5xl font-bold bg-gradient-to-b from-cyan-100 to-blue-100 rounded-2xl outline-none" />
            </div>
            <div class="flex flex-col gap-1 ml-3">
              <button @click="setAmPm('AM')"
                :class="['px-3 py-1.5 rounded-lg text-sm font-bold transition-all',
                  currentAmPm === 'AM' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-400']">AM</button>
              <button @click="setAmPm('PM')"
                :class="['px-3 py-1.5 rounded-lg text-sm font-bold transition-all',
                  currentAmPm === 'PM' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-400']">PM</button>
            </div>
          </div>
          <div class="mb-6">
            <p class="text-sm font-semibold text-gray-500 mb-3">Quick duration</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="d in [30, 60, 90, 120, 180, 240]" :key="d" @click="setQuickDuration(d)"
                :class="['px-3 py-1.5 rounded-full text-sm font-semibold transition-all',
                  duration === d ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600']">
                {{ formatDuration(d) }}
              </button>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="showTimeModal = false"
              class="flex-1 py-3 border border-gray-200 rounded-full text-base font-bold text-gray-600">CANCEL</button>
            <button @click="confirmTime"
              class="flex-1 py-3 bg-gray-900 text-white rounded-full text-base font-bold active:scale-95">OK</button>
          </div>
        </div>
      </ion-modal>

      <!-- ROUTINE MENU -->
      <ion-modal :is-open="showRoutineMenu" @didDismiss="showRoutineMenu = false" :initial-breakpoint="0.45" :breakpoints="[0, 0.45]">
        <div class="p-6">
          <div class="space-y-1">
            <button v-for="opt in routineOptions" :key="opt.type"
              class="w-full py-3.5 px-2 text-left text-base text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              @click="selectRoutine(opt)">
              {{ opt.label }}
            </button>
            <button class="w-full py-3.5 px-2 text-left text-base text-red-500 font-medium hover:bg-red-50 rounded-lg"
              @click="clearRoutine">
              Clear
            </button>
          </div>
        </div>
      </ion-modal>

      <!-- CATEGORY PICKER -->
      <ion-modal :is-open="showCategoryPicker" @didDismiss="showCategoryPicker = false" :initial-breakpoint="0.35" :breakpoints="[0, 0.35]">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Select Category</h3>
          <div class="space-y-1">
            <button v-for="cat in allCategories" :key="cat"
              @click="selectedCategory = cat; showCategoryPicker = false"
              class="w-full py-3 px-3 text-left rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
              :class="{ 'bg-gray-100': selectedCategory === cat }">
              <div class="w-3 h-3 rounded-full" :class="getCategoryDotColor(cat)"></div>
              <span class="font-semibold text-gray-800">{{ cat }}</span>
            </button>
          </div>
        </div>
      </ion-modal>

      <!-- PRIORITY PICKER -->
      <ion-modal :is-open="showPriorityPicker" @didDismiss="showPriorityPicker = false" :initial-breakpoint="0.3" :breakpoints="[0, 0.3]">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Set Priority</h3>
          <div class="space-y-1">
            <button v-for="p in ['high', 'medium', 'low', null]" :key="String(p)"
              @click="selectedPriority = p as any; showPriorityPicker = false"
              class="w-full py-3 px-3 text-left rounded-xl flex items-center gap-3 hover:bg-gray-50"
              :class="{ 'bg-gray-100': selectedPriority === p }">
              <div class="w-3 h-3 rounded-full"
                :class="{
                  'bg-red-500': p === 'high', 'bg-yellow-500': p === 'medium',
                  'bg-blue-400': p === 'low', 'bg-gray-300': p === null,
                }"></div>
              <span class="font-semibold text-gray-800">{{ p ? p.charAt(0).toUpperCase() + p.slice(1) : 'None' }}</span>
            </button>
          </div>
        </div>
      </ion-modal>

      <!-- LABEL PICKER -->
      <ion-modal :is-open="showLabelPicker" @didDismiss="showLabelPicker = false" :initial-breakpoint="0.45" :breakpoints="[0, 0.45]">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Select Labels</h3>
          <div v-if="availableLabels.length === 0" class="text-center py-8">
            <p class="text-gray-400 text-sm">No labels found</p>
          </div>
          <div v-else class="space-y-1 max-h-64 overflow-y-auto">
            <button v-for="label in availableLabels" :key="label.id"
              @click="toggleLabel(label)"
              class="w-full py-3 px-3 text-left rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
              :class="{ 'bg-blue-50': isLabelSelected(label.id) }">
              <ion-icon :icon="pricetagOutline" :color="label.color || 'medium'" class="text-lg"></ion-icon>
              <span class="font-semibold text-gray-800 flex-1">{{ label.name }}</span>
              <ion-icon v-if="isLabelSelected(label.id)" :icon="checkmarkOutline" class="text-blue-500"></ion-icon>
            </button>
          </div>
          <button @click="showLabelPicker = false"
            class="w-full py-3 bg-gray-900 text-white font-bold text-sm rounded-full mt-4 active:scale-95">
            Done
          </button>
        </div>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage, IonContent, IonIcon, IonModal,
  toastController, alertController,
} from '@ionic/vue';
import {
  arrowBack, closeCircle, calendarOutline, chevronForward,
  repeatOutline, ellipsisHorizontal, listOutline, pricetagOutline,
  checkmarkOutline, trashOutline, checkmark,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import type { CategoryName, RoutineConfig, Subtask } from '@/types/task';

import { db, auth, collection, query, where, onSnapshot } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const route = useRoute();
const store = useTaskStore();
const taskId = route.params.id as string;

// ---- Task data ----
const taskTitle = ref('');
const selectedCategory = ref<CategoryName>('Others');
const selectedDate = ref<string | null>(null);
const startTime = ref<string | null>(null);
const endTime = ref<string | null>(null);
const duration = ref<number | null>(null);
const selectedPriority = ref<'low' | 'medium' | 'high' | null>(null);
const routineConfig = ref<RoutineConfig | null>(null);
const subtasks = ref<Subtask[]>([]);

// ---- Labels ----
interface LabelItem { id: string; name: string; color: string; }
const availableLabels = ref<LabelItem[]>([]);
const selectedLabels = ref<LabelItem[]>([]);
const showLabelPicker = ref(false);
let unsubscribeLabels: any = null;

// ---- Modals ----
const showDateModal = ref(false);
const showTimeModal = ref(false);
const showRoutineMenu = ref(false);
const showCategoryPicker = ref(false);
const showPriorityPicker = ref(false);
const showMoreMenu = ref(false);

// ---- Load existing task ----
onMounted(() => {
  const task = store.tasks.find((t) => t.id === taskId);
  if (task) {
    taskTitle.value = task.title;
    selectedCategory.value = task.category;
    selectedDate.value = task.date;
    startTime.value = task.startTime;
    endTime.value = task.endTime;
    duration.value = task.duration;
    selectedPriority.value = task.priority;
    routineConfig.value = task.routine ? { ...task.routine } : null;
    subtasks.value = task.subtasks ? task.subtasks.map((s) => ({ ...s })) : [];

    // Parse start/end time into temp fields
    if (task.startTime) {
      const { hour, ampm } = to12h(parseInt(task.startTime.split(':')[0]));
      tempStartHour.value = hour.toString().padStart(2, '0');
      tempStartMin.value = task.startTime.split(':')[1] || '00';
      tempStartAmPm.value = ampm;
    }
    if (task.endTime) {
      const { hour, ampm } = to12h(parseInt(task.endTime.split(':')[0]));
      tempEndHour.value = hour.toString().padStart(2, '0');
      tempEndMin.value = task.endTime.split(':')[1] || '00';
      tempEndAmPm.value = ampm;
    }
  }

  // Load labels
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (unsubscribeLabels) unsubscribeLabels();
      const q = query(collection(db, 'labels'), where('userId', '==', user.uid));
      unsubscribeLabels = onSnapshot(q, (snapshot) => {
        availableLabels.value = snapshot.docs.map((doc) => ({
          id: doc.id, name: doc.data().name, color: doc.data().color || 'medium',
        }));
        // Pre-select labels that the task already has
        if (task?.labels) {
          selectedLabels.value = availableLabels.value.filter((l) => task.labels.includes(l.id));
        }
      });
    }
  });
});

onUnmounted(() => { if (unsubscribeLabels) unsubscribeLabels(); });

// ---- Label helpers ----
function toggleLabel(label: LabelItem) {
  const idx = selectedLabels.value.findIndex((l) => l.id === label.id);
  if (idx >= 0) selectedLabels.value.splice(idx, 1);
  else selectedLabels.value.push(label);
}
function isLabelSelected(id: string): boolean { return selectedLabels.value.some((l) => l.id === id); }
function removeLabel(id: string) { selectedLabels.value = selectedLabels.value.filter((l) => l.id !== id); }
function getLabelChipClass(color: string): string {
  const map: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-700', secondary: 'bg-cyan-100 text-cyan-700',
    tertiary: 'bg-purple-100 text-purple-700', success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700', danger: 'bg-red-100 text-red-600',
    medium: 'bg-gray-100 text-gray-700',
  };
  return map[color] || 'bg-gray-100 text-gray-700';
}

// ---- Time Picker State ----
const timeTab = ref<'start' | 'end'>('start');
const tempStartHour = ref('09');
const tempStartMin = ref('00');
const tempStartAmPm = ref<'AM' | 'PM'>('AM');
const tempEndHour = ref('10');
const tempEndMin = ref('00');
const tempEndAmPm = ref<'AM' | 'PM'>('AM');

const currentAmPm = computed(() => timeTab.value === 'start' ? tempStartAmPm.value : tempEndAmPm.value);

function setHour(e: Event) {
  const val = (e.target as HTMLInputElement).value.padStart(2, '0');
  if (timeTab.value === 'start') tempStartHour.value = val; else tempEndHour.value = val;
}
function setMinute(e: Event) {
  const val = (e.target as HTMLInputElement).value.padStart(2, '0');
  if (timeTab.value === 'start') tempStartMin.value = val; else tempEndMin.value = val;
}
function setAmPm(v: 'AM' | 'PM') {
  if (timeTab.value === 'start') tempStartAmPm.value = v; else tempEndAmPm.value = v;
}

function to24h(hour: number, ampm: 'AM' | 'PM'): number {
  if (ampm === 'PM' && hour !== 12) return hour + 12;
  if (ampm === 'AM' && hour === 12) return 0;
  return hour;
}
function to12h(hour24: number): { hour: number; ampm: 'AM' | 'PM' } {
  if (hour24 === 0) return { hour: 12, ampm: 'AM' };
  if (hour24 < 12) return { hour: hour24, ampm: 'AM' };
  if (hour24 === 12) return { hour: 12, ampm: 'PM' };
  return { hour: hour24 - 12, ampm: 'PM' };
}

function setQuickDuration(mins: number) {
  if (duration.value === mins) { duration.value = null; return; }
  duration.value = mins;
  const startH24 = to24h(parseInt(tempStartHour.value), tempStartAmPm.value);
  const startM = parseInt(tempStartMin.value);
  const totalEndMins = startH24 * 60 + startM + mins;
  const endH24 = Math.floor(totalEndMins / 60) % 24;
  const endM = totalEndMins % 60;
  const { hour: endH12, ampm: endAmPm } = to12h(endH24);
  tempEndHour.value = endH12.toString().padStart(2, '0');
  tempEndMin.value = endM.toString().padStart(2, '0');
  tempEndAmPm.value = endAmPm;
}

function confirmTime() {
  const sh24 = to24h(parseInt(tempStartHour.value), tempStartAmPm.value);
  const sm = parseInt(tempStartMin.value);
  startTime.value = `${sh24.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')}`;
  const eh24 = to24h(parseInt(tempEndHour.value), tempEndAmPm.value);
  const em = parseInt(tempEndMin.value);
  endTime.value = `${eh24.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
  if (duration.value) { /* keep it */ }
  else {
    const startMins = sh24 * 60 + sm;
    const endMins = eh24 * 60 + em;
    if (endMins > startMins) duration.value = endMins - startMins;
  }
  showTimeModal.value = false;
}

// ---- Date modal ----
function openDateModal() {
  if (!selectedDate.value) selectedDate.value = new Date().toISOString().split('T')[0];
  showDateModal.value = true;
}

// ---- Routine ----
const routineOptions = computed(() => {
  const d = selectedDate.value ? new Date(selectedDate.value + 'T00:00:00') : new Date();
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const dayOfMonth = d.getDate();
  const ordinal = getOrdinal(dayOfMonth);
  const monthName = d.toLocaleDateString('en-US', { month: 'long' });
  return [
    { type: 'daily' as const, label: 'Every day' },
    { type: 'weekly' as const, label: `Every week on ${dayName.slice(0, 3)}` },
    { type: 'weekday' as const, label: 'Every weekday (Mon - Fri)' },
    { type: 'monthly' as const, label: `Every month on the ${dayOfMonth}${ordinal}` },
    { type: 'yearly' as const, label: `Every year on ${monthName} ${dayOfMonth}${ordinal}` },
  ];
});

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function selectRoutine(opt: { type: RoutineConfig['type']; label: string }) {
  routineConfig.value = {
    type: opt.type, basedOn: 'scheduled', interval: 1,
    unit: opt.type === 'daily' ? 'day' : opt.type === 'weekly' || opt.type === 'weekday' ? 'week' : opt.type === 'monthly' ? 'month' : 'year',
    endsNever: true, endDate: null,
  };
  showRoutineMenu.value = false;
}
function clearRoutine() { routineConfig.value = null; showRoutineMenu.value = false; }
function getRoutineLabel(): string {
  if (!routineConfig.value) return '';
  const r = routineConfig.value;
  if (r.type === 'custom') return `Every ${r.interval} ${r.unit}${r.interval > 1 ? 's' : ''}`;
  const opt = routineOptions.value.find((o) => o.type === r.type);
  return opt?.label || 'Repeating';
}

// ---- Calendar ----
const visibleMonths = computed(() => {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(), month: d.getMonth(),
      days: getMonthDays(d.getFullYear(), d.getMonth()),
    });
  }
  return months;
});
function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(offset).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}
function selectCalendarDate(year: number, month: number, day: number) {
  selectedDate.value = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
function isSelectedDay(year: number, month: number, day: number): boolean {
  if (!selectedDate.value) return false;
  return selectedDate.value === `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

const quickDateOptions = computed(() => {
  const today = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' });
  const iso = (d: Date) => d.toISOString().split('T')[0];
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const laterThisWeek = new Date(today); laterThisWeek.setDate(today.getDate() + 2);
  const weekend = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToSat = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
  weekend.setDate(today.getDate() + daysToSat);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + (8 - (dayOfWeek || 7)));
  return [
    { label: 'Tomorrow', day: fmt(tomorrow), value: iso(tomorrow) },
    { label: 'Later this week', day: fmt(laterThisWeek), value: iso(laterThisWeek) },
    { label: 'This weekend', day: fmt(weekend), value: iso(weekend) },
    { label: 'Next week', day: fmt(nextWeek), value: iso(nextWeek) },
  ];
});
function selectQuickDate(dateStr: string) { selectedDate.value = dateStr; }
function clearDate() { selectedDate.value = null; }

// ---- Helpers ----
const allCategories: CategoryName[] = ['Health', 'Work', 'Mental Health', 'Others'];
function getCategoryChipClass(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-100 text-cyan-700', Work: 'bg-green-100 text-green-700',
    'Mental Health': 'bg-purple-100 text-purple-700', Others: 'bg-amber-100 text-amber-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}
function getCategoryDotColor(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-500', Work: 'bg-green-500', 'Mental Health': 'bg-purple-500', Others: 'bg-amber-500',
  };
  return map[cat] || 'bg-gray-500';
}
function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
function addSubtask() {
  subtasks.value.push({ id: Date.now().toString(), title: '', completed: false });
}

// ---- Save ----
async function saveTask() {
  if (!taskTitle.value.trim()) return;
  await store.updateTask(taskId, {
    title: taskTitle.value.trim(),
    category: selectedCategory.value,
    date: selectedDate.value,
    startTime: startTime.value,
    endTime: endTime.value,
    duration: duration.value,
    priority: selectedPriority.value,
    routine: routineConfig.value,
    subtasks: subtasks.value.filter((s) => s.title.trim()),
    labels: selectedLabels.value.map((l) => l.id),
  });
  const toast = await toastController.create({ message: '✅ Task updated!', duration: 1500, position: 'bottom', color: 'success' });
  await toast.present();
  router.back();
}

// ---- Delete ----
async function confirmDelete() {
  const alert = await alertController.create({
    header: 'Delete Task',
    message: 'Are you sure you want to delete this task?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete', role: 'destructive',
        handler: async () => {
          await store.deleteTask(taskId);
          const toast = await toastController.create({ message: '🗑️ Task deleted', duration: 1500, position: 'bottom', color: 'danger' });
          await toast.present();
          router.back();
        },
      },
    ],
  });
  await alert.present();
}

function goBack() { router.back(); }
</script>

<style scoped>
.edit-task-content { --background: #ffffff; }
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; }
.dropup-enter-active { transition: all 0.2s ease-out; }
.dropup-leave-active { transition: all 0.15s ease-in; }
.dropup-enter-from { opacity: 0; transform: translateY(8px) scale(0.95); }
.dropup-leave-to { opacity: 0; transform: translateY(8px) scale(0.95); }
</style>
