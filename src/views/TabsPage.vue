<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon aria-hidden="true" :icon="settings" />
          <ion-label>Settings</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="queue" href="/tabs/queue">
          <ion-icon aria-hidden="true" :icon="ellipse" />
          <ion-label>Queue</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="programs" href="/tabs/programs">
          <ion-icon aria-hidden="true" :icon="square" />
          <ion-label>Programs</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="schedule" href="/tabs/schedule">
          <ion-icon aria-hidden="true" :icon="calendar" />
          <ion-label>Schedule</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="events" href="/tabs/events">
          <ion-icon aria-hidden="true" :icon="time" />
          <ion-label>Events</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue'
import { ellipse, square, triangle, calendar, time, settings } from 'ionicons/icons'
</script>
