<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding bg-gray-50">
      
      <div class="pb-24 px-4 pt-2"> 
        
        <header class="mb-8 mt-6 flex justify-between items-end">
          <div>
            <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Inbox</h1>
            <p class="text-gray-500 text-lg font-medium mt-1">You have 5 tasks</p>
          </div>
          
          <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
             <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </header>

        <section class="grid grid-cols-2 gap-4 mb-8">
          <div 
            v-for="(cat, index) in categories" 
            :key="index"
            :class="[
              'relative p-5 rounded-[2rem] h-40 flex flex-col justify-between shadow-sm transition-transform active:scale-95',
              cat.bgColor
            ]"
          >
            <div class="bg-white/40 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
               <component :is="cat.icon" class="w-6 h-6 text-gray-800" />
            </div>
            
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ cat.count }}</p>
              <p class="text-sm font-semibold text-gray-800/70 mt-1">{{ cat.name }}</p>
            </div>
          </div>
        </section>

        <section>
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-xl font-bold text-gray-900">Recent Tasks</h3>
             <button class="text-blue-500 text-sm font-semibold">See all</button>
          </div>
          
          <div class="space-y-4">
             <div class="flex items-start gap-4 p-5 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div class="mt-1 w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center"></div>
                <div class="flex-1">
                   <p class="text-lg font-bold text-gray-800">Drink water</p>
                   <span class="mt-2 inline-block px-2 py-1 rounded-md bg-cyan-100 text-cyan-700 text-xs font-bold tracking-wide">HEALTH</span>
                </div>
             </div>

             <div class="flex items-start gap-4 p-5 bg-white/60 rounded-3xl shadow-sm border border-gray-100">
                <div class="mt-1 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                   <CheckIcon class="w-4 h-4 text-white" />
                </div>
                <div class="flex-1 opacity-50">
                   <p class="text-lg font-bold text-gray-800 line-through">Read books</p>
                   <span class="mt-2 inline-block px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold tracking-wide">WORK</span>
                </div>
             </div>
          </div>
        </section>
      </div>

      <div class="fixed bottom-24 right-6 z-10">
        <button class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all">
          <PlusIcon class="w-8 h-8" />
        </button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { HeartIcon, BriefcaseIcon, FaceSmileIcon, FolderIcon, PlusIcon, CheckIcon } from '@heroicons/vue/24/solid';

const categories = ref([
  { name: 'Health', count: 6, icon: HeartIcon, bgColor: 'bg-cyan-200' },
  { name: 'Work', count: 5, icon: BriefcaseIcon, bgColor: 'bg-green-200' },
  { name: 'Mental', count: 4, icon: FaceSmileIcon, bgColor: 'bg-purple-200' },
  { name: 'Others', count: 13, icon: FolderIcon, bgColor: 'bg-orange-200' },
]);
</script>