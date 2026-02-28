<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/profile" />
        </ion-buttons>
        <ion-title>Analytics</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg-gray-50">
      <div class="max-w-md mx-auto px-4 py-6 space-y-6">

        <!-- Monthly Chart -->
        <div class="bg-white rounded-3xl shadow-sm p-5">
          <h2 class="text-base font-semibold text-gray-800 mb-4">
            Monthly Completion
          </h2>

          <div class="flex items-end justify-between h-32">
            <div
              v-for="m in monthlyCounts"
              :key="m.month"
              class="flex flex-col items-center flex-1"
            >
              <div
                class="w-6 rounded-xl bg-gradient-to-t from-green-400 to-green-300 transition-all duration-500"
                :style="{ height: (m.count * 8 + 10) + 'px' }"
              ></div>
              <span class="text-xs text-gray-500 mt-1">
                {{ m.month }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">

          <!-- Finish Rate -->
          <div class="bg-white rounded-3xl shadow-sm p-5 flex flex-col items-center">
            <div class="relative w-24 h-24">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="#e5e7eb"
                  stroke-width="4"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="#3b82f6"
                  stroke-width="4"
                  fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="94.2"
                  :stroke-dashoffset="94.2 - (94.2 * finishPercent / 100)"
                  class="transition-all duration-700"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-800">
                  {{ finishPercent }}%
                </span>
              </div>
            </div>
            <span class="text-xs text-gray-500 mt-2">
              Finish Rate
            </span>
          </div>

          <!-- Avg Per Day -->
          <div class="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-5 flex flex-col items-center justify-center">
            <span class="text-3xl font-bold text-pink-600">
              {{ avgPerDay }}
            </span>
            <span class="text-xs text-gray-600 mt-1">
              Tasks / Day
            </span>
          </div>

          <!-- Productivity Change -->
          <div class="col-span-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-5 flex flex-col items-center">
            <span
              :class="[
                'text-3xl font-bold',
                productivityChange !== null && productivityChange < 0
                  ? 'text-red-600'
                  : 'text-green-600'
              ]"
            >
              {{
                productivityChange !== null
                  ? (productivityChange > 0 ? '+' : '') + productivityChange + '%'
                  : '—'
              }}
            </span>
            <span class="text-xs text-gray-700 mt-1">
              Productivity Change
            </span>
          </div>

        </div>

        <!-- Summary -->
        <div class="bg-white rounded-3xl shadow-sm p-5">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">
            Summary
          </h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            {{ resultMessage }}
          </p>
          <!-- debug info -->
          <div class="mt-4 text-xs text-gray-400">
            <p>Store completed tasks: {{ store.completedTasks.length }}</p>
            <p>Completed this month: {{ completedThisMonth.length }}</p>
            <p>Days in month: {{ daysCurrent }}</p>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent
} from '@ionic/vue';
import { useTaskStore } from '@/stores/taskStore';

const store = useTaskStore();
const now = new Date();

/* ------------------ Monthly Chart ------------------ */

const monthsBack = 6;

const monthlyCounts = computed(() => {
  const arr: Array<{ month: string; count: number }> = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });

    const count = store.completedTasks.filter((t) => {
      if (!t.date) return false;
      const td = new Date(t.date);
      return (
        td.getMonth() === d.getMonth() &&
        td.getFullYear() === d.getFullYear()
      );
    }).length;

    arr.push({ month: monthName, count });
  }

  return arr;
});

/* ------------------ Current Month ------------------ */

const completedThisMonth = computed(() => {
  return store.completedTasks.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
});

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const daysCurrent = daysInMonth(now.getFullYear(), now.getMonth());

const totalCompleted = computed(
  () => completedThisMonth.value.length
);

const avgPerDay = computed(() => {
  const avg = totalCompleted.value / daysCurrent;
  return avg.toFixed(1);
});

/* ------------------ Previous Month ------------------ */

const prevMonth = new Date(
  now.getFullYear(),
  now.getMonth() - 1,
  1
);

const completedPrevMonth = computed(() => {
  return store.completedTasks.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return (
      d.getMonth() === prevMonth.getMonth() &&
      d.getFullYear() === prevMonth.getFullYear()
    );
  });
});

const daysPrev = daysInMonth(
  prevMonth.getFullYear(),
  prevMonth.getMonth()
);

const avgPrev = computed(() => {
  const avg = completedPrevMonth.value.length / daysPrev;
  return avg.toFixed(1);
});

const productivityChange = computed<number | null>(() => {
  const prev = parseFloat(avgPrev.value);
  if (prev === 0) return null;

  const change =
    ((parseFloat(avgPerDay.value) - prev) / prev) * 100;

  return Math.round(change);
});

/* ------------------ Finish % ------------------ */

const finishedDaysCount = computed(() => {
  const days = new Set<number>();

  for (const t of completedThisMonth.value) {
    if (t.date) {
      days.add(new Date(t.date).getDate());
    }
  }

  return days.size;
});

const finishPercent = computed(() =>
  Math.round((finishedDaysCount.value / daysCurrent) * 100)
);

/* ------------------ Result Message ------------------ */

const resultMessage = computed(() => {
  const p = finishPercent.value;

  if (p >= 80) return 'Excellent work! 🏆 You are highly consistent.';
  if (p >= 50) return 'Good progress 👍 Keep building the habit.';
  return 'Let’s try to complete more days next month.';
});
</script>

<style scoped>
ion-content {
  --background: #f9fafb;
}
</style>