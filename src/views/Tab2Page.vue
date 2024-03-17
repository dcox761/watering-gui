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
                <ion-button @click="apiAction('resume', loading)" v-if="status.pause_min > 0"><ion-icon slot="start"
                    :icon="play" />Resume</ion-button>
                <ion-button @click="apiAction('pause', loading)" v-if="status.pause_min == 0"><ion-icon slot="start"
                    :icon="pause" />Pause</ion-button>
              </ion-col>
              <p v-if="status.pause_min > 0">Pausing for {{ Math.round(status.pause_min * 10) / 10 }} min</p>
              <ion-col>
              </ion-col>
              <ion-col>
                <ion-button class="ion-float-right" @click="apiAction('stop', loading)" v-if="status.pause_min == 0">
                  <ion-icon slot="start" :icon="stop" />Stop/Clear</ion-button>
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

import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { updateStatus, apiAction } from "../api"

const store = useStore()
const { settings, status, error } = storeToRefs(store)

const loading = ref()

// TODO: Content flashes switching from Tab1 after Connect (maybe because of delay to read status before mount)
// onMounted also flashes
onMounted(async () => {
  // may be reloading this tab directly without clicking Connect
  if (!status.value) {
    return updateStatus()
  }
})

const handleRefresh = async (event: CustomEvent) => {
  // https://ionicframework.com/docs/api/refresher
  return updateStatus()
    .then(() => {
      if (event.target) {
        event.target.complete()
      }
    })
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