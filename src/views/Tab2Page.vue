<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Queue</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Queue</ion-title>
        </ion-toolbar>
      </ion-header>
      <div>{{ error_message }}</div>
      <ion-loading ref="loading" />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      <div v-if="status && status.stations.length > 0">
      </div>
      <!-- TODO: show paused time remaining -->
      <ion-list v-if="status && status.stations.length > 0">
        <ion-item>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-button @click="handleResumeClick" v-if="status.pause_min > 0"><ion-icon slot="start"
                    :icon="play" />Resume</ion-button>
                <ion-button @click="handlePauseClick" v-if="status.pause_min == 0"><ion-icon slot="start"
                    :icon="pause" />Pause</ion-button>
              </ion-col>
              <ion-col>
              </ion-col>
              <ion-col>
                <ion-button class="ion-float-right" @click="handleStopClick" v-if="status.pause_min == 0"><ion-icon slot="start" :icon="stop"/>Stop</ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-item>
        <ion-item v-for="station in status.stations">
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-label>{{ station.name }}</ion-label>
              </ion-col>
              <ion-col>
                <ion-label>{{ station.run_time }} min</ion-label>
              </ion-col>
              <ion-col>
                <ion-icon class="right-blue" :icon="water" v-if="station.on" />
                <ion-icon class="right-grey" :icon="water" v-else-if="station.current" />
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <ion-progress-bar :value="station.completion" />
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { water, play, pause, stop } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol,
  IonRefresher, IonRefresherContent, IonButton, IonLoading
} from '@ionic/vue';

import { storeToRefs } from 'pinia'
import { useStore } from '../main'
import { ref, onBeforeMount, onMounted } from 'vue'
import axios from "axios";

const store = useStore()
const { settings } = storeToRefs(store)
const loading = ref()
const status = ref()
const error_message = ref()

//const loading = ref()

// TODO: Content flashes switching from Tab1 after Connect (maybe because of delay to read status before mount)
// onMounted also flashes
onBeforeMount(async () => {
  await updateStatus()
})

const updateStatus = async () => {
  try {
    // TODO: use then instead of await
    // TODO: add loading with spinner
    const { data } = await axios.get(`http://${settings.value.apiAddress}:5000/queue/status`);
    // console.log(`Connected to ${settings.value.apiAddress}`)
    // console.log(data)
    status.value = data
  } catch (error: any) {
    console.log(error)
    status.value = ""
    error_message.value = `Unable to connect: ${error.message}`
  }
}

const handleRefresh = async (event: CustomEvent) => {
  // https://ionicframework.com/docs/api/refresher
  // TODO: example uses setTimeout but then there is always delay?
  updateStatus().then(() => {
    if (null != event.target) {
      event.target.complete()
    }
  })
}

const postAction = (action: string) => {
  console.log(`postAction: ${action}`)
  loading.value.$el.present()
  return axios.post(`http://${settings.value.apiAddress}:5000/${action}`).then((data) => {
    loading.value.$el.dismiss()
    // console.log(data)
    return updateStatus()
  }).catch((error) => {
    loading.value.$el.dismiss()
    console.log(error)
    // TODO: format error nicely
    error_message.value = `Error: ${error.message}`
  });
}

const handleResumeClick = async () => {
  return postAction("resume")
}

const handlePauseClick = async () => {
  return postAction("pause")
}

const handleStopClick = async () => {
  return postAction("stop")
}
</script>

<style>
/* colouring icon - but need to change based on status
ion-icon {
  color: blue;
} */

.right-grey {
  color: grey;
  float: right;
}

.right-blue {
  color: blue;
  float: right;
}
</style>