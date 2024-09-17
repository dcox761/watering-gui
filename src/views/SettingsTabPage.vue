<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-loading ref="loading" message="Connecting ..." />
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-input label="API Address" v-model="settings.apiAddress" />
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button fill="clear" @click="handleConnectClick" id="connect-button">Connect</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-title>Build Date: {{ buildDate }}</ion-title>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonFooter,
  IonInput, IonButton, IonLoading
} from '@ionic/vue'

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"

const store = useStore()
const { settings } = storeToRefs(store)

const loading = ref()

const buildDate = process.env.BUILD_DATE

const handleConnectClick = async () => {
  console.log("handleConnectClick")
  // store should already be updated by Pinia, just need to save to local storage
  // TODO: activate and save on successful connection
  store.save()
  // store.updateSettings({
  //   apiAddress: settings.value.apiAddress
  // })

  // check connection
  // TODO: nicer error - Unable to connect: message
  return apiRequest('', undefined, undefined,
    loading, 'queue')
    .then((data) => {
      // TODO: don't show connected if there was an error!
      console.log("handleConnectClick: connected")
    })
}

</script>
