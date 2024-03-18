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
      <ion-list>
        <ion-item>
          <ion-input label="API Address" v-model="settings.apiAddress" />
        </ion-item>
        <ion-item>
          <ion-button @click="handleConnectClick" id="connect-button">Connect</ion-button>
          <ion-loading ref="loading" message="Connecting ..." />
        </ion-item>
      </ion-list>
      <div>{{ error }}</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonList, IonItem, IonButton, IonLoading
} from '@ionic/vue';

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"

const store = useStore()
const { settings, status, error } = storeToRefs(store)

const loading = ref()

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
      console.log("handleConnectClick: connected")
    })
}

</script>
