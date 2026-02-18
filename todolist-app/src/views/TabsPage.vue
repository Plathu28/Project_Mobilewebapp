<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom" class="tabs-bar">
        <ion-tab-button tab="inbox" href="/tabs/inbox">
          <ion-icon :icon="fileTrayFullOutline" />
          <ion-label>Inbox</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="today" href="/tabs/today">
          <ion-icon :icon="calendarOutline" />
          <ion-label>Today</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="upcoming" href="/tabs/upcoming">
          <ion-icon :icon="calendarNumberOutline" />
          <ion-label>Upcoming</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="browse" href="/tabs/browse">
          <ion-icon :icon="gridOutline" />
          <ion-label>Browse</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from '@ionic/vue';
import {
  fileTrayFullOutline,
  calendarOutline,
  calendarNumberOutline,
  gridOutline,
} from 'ionicons/icons';
</script>

<style scoped>
.tabs-bar {
  padding-bottom: 8px;
  padding-top: 4px;
  border-top: 1px solid #f3f4f6;
  --background: #ffffff;
}

ion-tab-button {
  --color: #9ca3af;
  --color-selected: #3b82f6;
}
</style>
