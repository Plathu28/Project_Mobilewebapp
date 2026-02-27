<template>
  <ion-page>
    <ion-content :fullscreen="true" class="search-content">
      <div class="pb-28">

        <!-- Header -->
        <div class="flex items-center px-4 pt-12 pb-4 gap-3">
          <button
            @click="router.back()"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0 active:scale-90 transition-transform"
          >
            <ion-icon :icon="arrowBack" class="text-gray-700 text-xl"></ion-icon>
          </button>

          <!-- Search Bar -->
          <div class="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <ion-icon :icon="searchOutline" class="text-gray-400 text-lg flex-shrink-0"></ion-icon>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Search tasks..."
              class="flex-1 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            <button v-if="query" @click="query = ''" class="text-gray-300 active:text-gray-500">
              <ion-icon :icon="closeCircle" class="text-xl"></ion-icon>
            </button>
          </div>
        </div>

        <!-- Recent / Empty hint -->
        <div v-if="!query" class="px-4 mt-2">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">All Tasks</p>
          <div v-if="store.activeTasks.length === 0" class="flex flex-col items-center py-16">
            <ion-icon :icon="searchOutline" class="text-5xl text-gray-200 mb-3"></ion-icon>
            <p class="text-gray-400 text-sm">No tasks yet. Add one first!</p>
          </div>
          <div v-else class="space-y-2">
            <TaskCard v-for="task in store.activeTasks" :key="task.id" :task="task" />
          </div>
        </div>

        <!-- Search Results -->
        <div v-else class="px-4 mt-2">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {{ results.length }} result{{ results.length !== 1 ? 's' : '' }} for "{{ query }}"
          </p>

          <!-- No results -->
          <div v-if="results.length === 0" class="flex flex-col items-center py-16">
            <ion-icon :icon="searchOutline" class="text-5xl text-gray-200 mb-3"></ion-icon>
            <p class="text-gray-600 font-semibold">No tasks found</p>
            <p class="text-gray-400 text-sm mt-1">Try a different keyword</p>
          </div>

          <!-- Results -->
          <div v-else class="space-y-2">
            <TaskCard v-for="task in results" :key="task.id" :task="task" :highlight="query" />
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { arrowBack, searchOutline, closeCircle } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';

// --- inline TaskCard component ---
import { defineComponent, h } from 'vue';

const TaskCard = defineComponent({
  props: {
    task: { type: Object, required: true },
    highlight: { type: String, default: '' },
  },
  setup(props) {
    const categoryColor: Record<string, string> = {
      Health: 'bg-cyan-100 text-cyan-700',
      Work: 'bg-green-100 text-green-700',
      'Mental Health': 'bg-purple-100 text-purple-700',
      Others: 'bg-amber-100 text-amber-700',
    };
    const borderColor: Record<string, string> = {
      Health: 'border-cyan-400',
      Work: 'border-green-400',
      'Mental Health': 'border-purple-400',
      Others: 'border-amber-400',
    };
    const priorityColor: Record<string, string> = {
      high: 'bg-red-100 text-red-600',
      medium: 'bg-yellow-100 text-yellow-600',
      low: 'bg-gray-100 text-gray-500',
    };

    function highlightText(text: string, q: string) {
      if (!q) return text;
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return text;
      return (
        text.slice(0, idx) +
        `<mark class="bg-yellow-200 text-gray-900 rounded px-0.5">${text.slice(idx, idx + q.length)}</mark>` +
        text.slice(idx + q.length)
      );
    }

    return () =>
      h('div', {
        class: 'flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100',
      }, [
        h('div', {
          class: `w-5 h-5 rounded-full border-2 flex-shrink-0 ${borderColor[props.task.category] || 'border-gray-300'}`,
        }),
        h('div', { class: 'flex-1 min-w-0' }, [
          h('p', {
            class: 'font-bold text-gray-900 text-sm truncate',
            innerHTML: highlightText(props.task.title, props.highlight),
          }),
          h('div', { class: 'flex items-center gap-2 mt-1 flex-wrap' }, [
            h('span', {
              class: `px-2 py-0.5 rounded text-xs font-bold ${categoryColor[props.task.category] || 'bg-gray-100 text-gray-600'}`,
            }, props.task.category),
            props.task.date
              ? h('span', { class: 'text-xs text-gray-400' }, formatDate(props.task.date))
              : null,
            props.task.startTime
              ? h('span', { class: 'text-xs text-gray-400' }, props.task.startTime)
              : null,
            props.task.priority
              ? h('span', {
                  class: `px-2 py-0.5 rounded text-xs font-semibold ${priorityColor[props.task.priority] || ''}`,
                }, props.task.priority)
              : null,
          ]),
        ]),
      ]);
  },
});

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

const router = useRouter();
const store = useTaskStore();

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  setTimeout(() => inputRef.value?.focus(), 300);
});

const results = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return [];
  return store.activeTasks.filter((t) =>
    t.title.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    (t.priority && t.priority.toLowerCase().includes(q))
  );
});
</script>

<style scoped>
.search-content {
  --background: #f9fafb;
}
</style>