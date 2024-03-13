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
      <ion-list v-if="status">
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
                <ion-icon class="right" :icon="water" v-if="station.on"/>
              </ion-col>          
            </ion-row>
            <ion-row>
              <ion-col>
                <ion-progress-bar :value="station.completion"/>
              </ion-col>          
            </ion-row>
          </ion-grid>
        </ion-item>
      </ion-list>

      <div>{{  error_message }}</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { water } from "ionicons/icons";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonProgressBar, IonGrid, IonRow, IonCol  } from '@ionic/vue';

import { storeToRefs } from 'pinia'
import { useStore } from '../main'
import { ref, onBeforeMount, onMounted } from 'vue'
import axios from "axios";

const store = useStore()
const { settings } = storeToRefs(store)
const status = ref()
const error_message = ref()

//const loading = ref()

// TODO: Content flashes switching from Tab1 after Connect (maybe because of delay to read status before mount)
// onMounted also flashes
onBeforeMount(async () => {
  try {
      // check connection
      // TODO: use then instead of await
      // TODO: use data from tab 1? OR add loading with spinner
      const { data } = await axios.get(`http://${settings.value.apiAddress}:5000/queue/status`);
      console.log(`Connected to ${settings.value.apiAddress}`)
      status.value = data
    } catch (error:any) {
      console.log(error)
      status.value = "X"
      error_message.value = `Unable to connect: ${error.message}`
    }
})

/*
TODO: Support automatic updates - at least ion-refresher to start with

TODO: Show Empty when queue is empty
*/

</script>

<style>
ion-icon {
  color: blue;
}

.right {
    float: right;
 }
</style>