<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Programs</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content padding :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Programs</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-loading ref="loading" />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list v-if="programs && Object.keys(programs).length > 0">
        <ion-item v-for="program in Object.keys(programs).sort()">
          <!-- TODO: improve layout -->
          <ion-button fill="clear" @click="handleClick(program)"><ion-icon slot="icon-only" :icon="play" /></ion-button>
          <ion-label>{{ program }}</ion-label>
          <ion-note class="ion-text-wrap ion-text-right">{{ programs[program] }}</ion-note>
        </ion-item>
      </ion-list>
      <ion-grid v-else>
        <ion-row text-center>
          <ion-col>
            <ion-text>No programs available.</ion-text>
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
const programs = ref()

onMounted(async () => {
  console.log('onMounted')
  if (!programs.value) {
    // TODO: also if address changes
    await updatePrograms()
  }
})

const updatePrograms = async () => {
  console.log('updatePrograms')
  return apiRequest('programs', undefined, false,
    loading, undefined, programs)
}

const handleRefresh = async (event: CustomEvent) => {
  console.log('handleRefresh')
  return updatePrograms()
    .then(() => {
      if (event.target) {
        (event.target as HTMLIonRefresherElement).complete()
      }
    })

  // TODO: update programs too?
}
const handleClick = async (program: string) => {
  console.log(`handleClick: ${program}`)
  return apiRequest(`start/${program}`, 'post', undefined,
    loading, 'queue')
}
</script>
