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
          <ion-button @click="handleStartClick(program)"><ion-icon slot="icon-only" :icon="play"/></ion-button>
          <ion-label>{{ program }}</ion-label>
          <ion-note class="ion-text-wrap ion-text-right">{{ programs[program] }}</ion-note>
        </ion-item>
      </ion-list>
      <IonText v-else>No programs available.</IonText>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { water, play, pause, stop } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol,
  IonRefresher, IonRefresherContent, IonButton, IonNote, IonLoading, IonText
} from '@ionic/vue';

import { storeToRefs } from 'pinia'
import { useStore } from '../main'
import { ref, onBeforeMount, onMounted } from 'vue'
import axios from "axios";
import { useRouter } from 'vue-router';

const store = useStore()
const { settings, status, error } = storeToRefs(store)
const loading = ref()
const programs = ref()
const router = useRouter()    // lookup router here, not inside click handler (avoid TypeError: (intermediate value)() is undefined)

onBeforeMount(async () => {
  await updatePrograms()
})

const updatePrograms = async () => {
  try {
    // TODO: use then instead of await
    // TODO: add loading with spinner
    const { data } = await axios.get(`http://${settings.value.apiAddress}:5000/programs`);
    // console.log(`Connected to ${settings.value.apiAddress}`)
    // console.log(data)
    programs.value = data
  } catch (error: any) {
    console.log(error)
    programs.value = ""
    error.value = `Unable to connect: ${error.message}`
  }
}

const postAction = async (action: string) => {
  // console.log(`postAction: ${action}`)
  loading.value.$el.present()
  return axios.post(`http://${settings.value.apiAddress}:5000/${action}`).then((data) => {
    loading.value.$el.dismiss()
    // console.log(data)
    // TODO: helper method in main (change to composition API store to access router)
    return store.updateStatus().then(() => {
      return router.push('/tabs/tab2')
    })
  }).catch((error) => {
    loading.value.$el.dismiss()
    console.log(error)
    // TODO: format error nicely, ion-toast?
    error.value = `Error: ${error.message}`
  });
}

const handleStartClick = (program: string) => {
  console.log(`click ${program}`)
  return postAction(`start/${program}`)
}


/* TODO
1. show schedule
2. new tab 4? for events
*/
</script>
<style>

</style>