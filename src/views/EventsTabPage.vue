<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Events</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content padding :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Events</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-loading ref="loading" />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list v-if="events && events.length > 0">
        <ion-item v-for="event in events">
          <ion-label class="ion-text-nowrap" style="flex: 0 0 auto; margin-right: 10px; white-space: nowrap;">{{ event.date }} {{ event.time }} {{ event.source }}</ion-label>
          <ion-label class="ion-text-wrap" style="flex: 1 1 auto;">{{ event.details }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-grid v-else>
        <ion-row text-center>
          <ion-col>
            <ion-text>No events available.</ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { play } from "ionicons/icons"
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonButton, IonNote, IonLoading,
  IonGrid, IonRow, IonCol, IonText, IonRefresher, IonRefresherContent
} from '@ionic/vue'

import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"

// const store = useStore()
// const { settings, status, error } = storeToRefs(store)

const loading = ref()
const events = ref()

onMounted(async () => {
  console.log('onMounted')
  if (!events.value) {
    // TODO: also if address changes
    await updateEvents()
  }
})

const updateEvents = async () => {
  console.log('updateEvents')
  return apiRequest('events', undefined, false,
    loading, undefined, undefined, undefined, (data: any) => {
    const parsedEvents = data.split('\n').map(line => {
      const match = line.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}):(.*?):(.*?)$/)
      if (match) {
        const [_, date, time, source, details] = match
        return { date, time, source, details }
      }
      return null
    }).filter(event => event !== null)
    events.value = parsedEvents.reverse()
  })  
}

const handleRefresh = async (event: CustomEvent) => {
  console.log('handleRefresh')
  return updateEvents()
    .then(() => {
      if (event.target) {
        (event.target as HTMLIonRefresherElement).complete()
      }
    })
}

</script>
