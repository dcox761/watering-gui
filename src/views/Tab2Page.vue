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
      <div>{{ error }}</div>
      <ion-loading ref="loading" />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list v-if="status && status.stations.length > 0">
        <ion-item>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-button @click="handleClick('resume')" v-if="status.pause_min > 0"><ion-icon slot="start"
                    :icon="play" />Resume</ion-button>
                <ion-button @click="handleClick('pause')" v-if="status.pause_min == 0"><ion-icon slot="start"
                    :icon="pause" />Pause</ion-button>
              </ion-col>
                <p v-if="status.pause_min > 0">Pausing for {{ Math.round(status.pause_min * 10)/10 }} min</p>
              <ion-col>
              </ion-col>
              <ion-col>
                <ion-button class="ion-float-right" @click="handleClick('stop')" v-if="status.pause_min == 0">
                  <ion-icon slot="start" :icon="stop"/>Stop/Clear</ion-button>
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
      <IonText v-else-if="status">Watering queue is empty.</IonText>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { water, play, pause, stop } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol,
  IonRefresher, IonRefresherContent, IonButton, IonLoading, IonText
} from '@ionic/vue';

import { storeToRefs } from 'pinia'
import { useStore } from '../main'
import { ref, onBeforeMount, onMounted } from 'vue'
import axios from "axios";

const store = useStore()
const { settings, status, error } = storeToRefs(store)
const loading = ref()


// TODO: Content flashes switching from Tab1 after Connect (maybe because of delay to read status before mount)
// onMounted also flashes
onMounted(async () => {
  // may be reloading this tab directly without clicking Connect
  if (!status.value) {
    return store.updateStatus()
  }
})

const handleRefresh = async (event: CustomEvent) => {
  // https://ionicframework.com/docs/api/refresher
  // TODO: example uses setTimeout but then there is always delay?
  return store.updateStatus()
  .then(() => {
    if (null != event.target) {
      event.target.complete()
    }
  })
}

const postAction = async (action: string) => {
  // console.log(`postAction: ${action}`)
  loading.value.$el.present()
  return axios.post(`http://${settings.value.apiAddress}:5000/${action}`)
  .then((data) => {
    // console.log(data)
    return store.updateStatus()
  })
  .catch((error) => {
    console.log(error)
    // TODO: format error nicely, red/centered, ion-toast?
    error.value = `Error: ${error.message}`
  })
  .finally(() => {
    loading.value.$el.dismiss()
  })
}

const handleClick = async (action: string) => {
  return postAction(action)
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