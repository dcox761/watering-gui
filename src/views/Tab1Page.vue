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
      <div>{{ error_message }}</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonList, IonItem, IonButton, IonLoading } from '@ionic/vue';
import { useRouter } from 'vue-router';

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import axios from "axios";

const store = useStore()
const { settings } = storeToRefs(store)
const error_message = ref()
const loading = ref()
const router = useRouter()    // lookup router here, not inside click handler (avoid TypeError: (intermediate value)() is undefined)
import { updateStatus } from "../api"

// TODO: move to API
const handleConnectClick = async () => {
  // console.log("CLICK: " + settings.value.apiAddress)
  // store should already be updated by Pinia, just need to save to local storage
  store.save()
  // store.updateSettings({
  //   apiAddress: settings.value.apiAddress
  // })

  // instead of trigger="connect-button" 
  loading.value.$el.present()

  // check connection
  return axios.get(`http://${settings.value.apiAddress}:5000/`)
  .then((data) => {
    console.log("handleConnectClick: connected")
    error_message.value = ""

    // console.log(data)
    return updateStatus()
  })
  .then(() => router.push('/tabs/tab2'))
  .catch((error) => {
    console.log(error)
    // TODO: format error nicely, red/centered, ion-toast?
    error_message.value = `Unable to connect: ${error.message}`
  })
  .finally(() => {
    loading.value.$el.dismiss()
  })
}

</script>
