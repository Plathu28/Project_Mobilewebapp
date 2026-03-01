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
          <h2 class="text-base font-semibold text-gray-800 mb-4">Monthly Completion</h2>
          <div class="flex items-end justify-between h-32">
            <div v-for="m in monthlyCounts" :key="m.month" class="flex flex-col items-center flex-1">
              <div
                class="w-6 rounded-xl bg-gradient-to-t from-green-400 to-green-300 transition-all duration-500"
                :style="{ height: barHeight(m.count) }"
              ></div>
              <span class="text-xs text-gray-500 mt-1">{{ m.month }}</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">

          <!-- Finish Rate -->
          <div class="bg-white rounded-3xl shadow-sm p-5 flex flex-col items-center">
            <div class="relative w-24 h-24">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" stroke="#e5e7eb" stroke-width="4" fill="none" />
                <circle
                  cx="18" cy="18" r="15"
                  stroke="#3b82f6" stroke-width="4" fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="94.2"
                  :stroke-dashoffset="94.2 - (94.2 * finishPercent / 100)"
                  class="transition-all duration-700"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-800">{{ finishPercent }}%</span>
              </div>
            </div>
            <span class="text-xs text-gray-500 mt-2">Finish Rate</span>
            <span class="text-xs text-gray-400 mt-0.5">vs overdue tasks</span>
          </div>

          <!-- Avg Per Day -->
          <div class="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-5 flex flex-col items-center justify-center">
            <span class="text-3xl font-bold text-pink-600">{{ avgPerDay }}</span>
            <span class="text-xs text-gray-600 mt-1">Tasks / Day</span>
            <span class="text-xs text-gray-500 mt-0.5">this month</span>
          </div>

          <!-- Productivity Change -->
          <div class="col-span-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-5 flex flex-col items-center">
            <span :class="['text-3xl font-bold', productivityChange !== null && productivityChange < 0 ? 'text-red-600' : 'text-green-600']">
              {{ productivityChange !== null ? (productivityChange > 0 ? '+' : '') + productivityChange + '%' : '—' }}
            </span>
            <span class="text-xs text-gray-700 mt-1">Productivity Change</span>
            <span class="text-xs text-gray-500 mt-0.5">
              {{ prevMonthName }} avg {{ avgPrev.toFixed(1) }} → {{ nowMonthName }} avg {{ avgPerDay }}/day
            </span>
          </div>

        </div>

        <!-- Summary -->
        <div class="bg-white rounded-3xl shadow-sm p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-800">Summary — {{ nowMonthName }}</h3>

          <!-- Stats rows -->
          <div class="space-y-2">
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">✅ Completed this month</span>
              <span class="text-sm font-bold text-green-600">{{ completedThisMonth.length }} tasks</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">⏰ Overdue (not done)</span>
              <span class="text-sm font-bold text-red-500">{{ overdueThisMonth.length }} tasks</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">📋 Active remaining</span>
              <span class="text-sm font-bold text-blue-500">{{ activeRemainingThisMonth.length }} tasks</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">📅 Days elapsed</span>
              <span class="text-sm font-bold text-gray-700">{{ daysElapsed }} / {{ daysCurrent }} days</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500">🔥 Last month completed</span>
              <span class="text-sm font-bold text-gray-700">{{ completedPrevMonth.length }} tasks</span>
            </div>
          </div>

          <!-- Message -->
          <p class="text-sm text-gray-400 leading-relaxed pt-1">{{ resultMessage }}</p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent } from '@ionic/vue';
import { useTaskStore } from '@/stores/taskStore';

const store = useTaskStore();
const now = new Date();
const today = now.toISOString().split('T')[0];

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function barHeight(count: number): string {
  const max = Math.max(...monthlyCounts.value.map(m => m.count), 1);
  return `${Math.round(8 + (count / max) * 92)}px`;
}

const nowMonthName = now.toLocaleString('default', { month: 'long' });
const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const prevMonthName = prevMonth.toLocaleString('default', { month: 'long' });
const daysCurrent = daysInMonth(now.getFullYear(), now.getMonth());
const daysElapsed = now.getDate();
const daysPrev = daysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());

/* ------------------ Monthly Chart ------------------ */
const monthlyCounts = computed(() => {
  const arr: Array<{ month: string; count: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = store.completedTasks.filter((t) => {
      if (!t.date) return false;
      const td = parseLocalDate(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    }).length;
    arr.push({ month: d.toLocaleString('default', { month: 'short' }), count });
  }
  return arr;
});

/* ------------------ This Month ------------------ */
const completedThisMonth = computed(() =>
  store.completedTasks.filter((t) => {
    if (!t.date) return false;
    const td = parseLocalDate(t.date);
    return td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
  })
);

// งานที่วันผ่านไปแล้วแต่ยังไม่เสร็จ (overdue)
const overdueThisMonth = computed(() =>
  store.activeTasks.filter((t) => {
    if (!t.date) return false;
    return t.date < today; // date น้อยกว่าวันนี้ = ผ่านไปแล้วแต่ยังไม่เสร็จ
  })
);

// งานที่ยังเหลืออยู่ในเดือนนี้ (วันนี้เป็นต้นไป)
const activeRemainingThisMonth = computed(() =>
  store.activeTasks.filter((t) => {
    if (!t.date) return false;
    const td = parseLocalDate(t.date);
    return t.date >= today &&
      td.getMonth() === now.getMonth() &&
      td.getFullYear() === now.getFullYear();
  })
);

// Tasks/Day = completed เดือนนี้ / วันที่ผ่านมา
const avgPerDay = computed(() =>
  (completedThisMonth.value.length / daysElapsed).toFixed(1)
);

// Finish Rate = completed / (completed + overdue) × 100
const finishPercent = computed(() => {
  const total = completedThisMonth.value.length + overdueThisMonth.value.length;
  if (total === 0) return 0;
  return Math.round((completedThisMonth.value.length / total) * 100);
});

/* ------------------ Previous Month ------------------ */
const completedPrevMonth = computed(() =>
  store.completedTasks.filter((t) => {
    if (!t.date) return false;
    const td = parseLocalDate(t.date);
    return td.getMonth() === prevMonth.getMonth() && td.getFullYear() === prevMonth.getFullYear();
  })
);

const avgPrev = computed(() => completedPrevMonth.value.length / daysPrev);

// Productivity Change = (avg เดือนนี้ - avg เดือนก่อน) / avg เดือนก่อน × 100
const productivityChange = computed<number | null>(() => {
  if (avgPrev.value === 0) return null;
  const change = ((parseFloat(avgPerDay.value) - avgPrev.value) / avgPrev.value) * 100;
  return Math.round(change);
});

/* ------------------ Result Message ------------------ */
const resultMessage = computed(() => {
  const p = finishPercent.value;
  if (p >= 80) return 'Excellent work! 🏆 You\'re crushing it this month.';
  if (p >= 50) return 'Good progress 👍 More than half done — keep it up!';
  if (p > 0) return 'You have some catching up to do. Push through! 💪';
  return 'No completed tasks yet this month. Start strong! 🚀';
});
</script>

<style scoped>
ion-content { --background: #f9fafb; }
</style>