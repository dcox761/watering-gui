<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Programs</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Programs</ion-title>
        </ion-toolbar>
      </ion-header>
      <div>{{ error }}</div>
      <ion-loading ref="loading" />
      <ion-list v-if="programs && Object.keys(programs).length > 0">
        <ion-item v-for="program in Object.keys(programs).sort()">
          <!-- TODO: improve layout -->
          <ion-button @click="handleClick(program)"><ion-icon slot="icon-only" :icon="play" /></ion-button>
          <ion-label>{{ program }}</ion-label>
          <ion-note class="ion-text-wrap ion-text-right">{{ programs[program] }}</ion-note>
        </ion-item>
      </ion-list>
      <IonText v-else>No programs available.</IonText>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { play } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonButton, IonNote, IonLoading, IonText
} from '@ionic/vue';

import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"

const store = useStore()
const { settings, status, error } = storeToRefs(store)

const loading = ref()
const programs = ref()

onMounted(async () => {
  if (!programs.value) {
    console.log('onMounted')
    // TODO: also if address changes
    await updatePrograms()
  }
})

const updatePrograms = async () => {
  console.log('updatePrograms')
  return apiRequest('programs', undefined, false,
    loading, undefined, programs)
}

const handleClick = async (program: string) => {
  console.log(`handleClick: ${program}`)
  return apiRequest(`start/${program}`, 'post', undefined,
    loading, 'queue')
}

/* TODO
1. show schedule
2. new tab 4? for events
*/
</script>
<style></style>