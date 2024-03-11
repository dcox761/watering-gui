<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-list>
        <ion-item>
          <ion-input label="API Address" v-model="settings.apiAddress"/>
        </ion-item>
        <ion-item>
          <ion-button @click="handleConnectClick">Connect</ion-button>
        </ion-item>
      </ion-list>
      <!-- <ExploreContainer name="Tab 1 page ..." /> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStore } from '../main'
  
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonList, IonItem, IonButton } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';

const store = useStore()
const { settings } = storeToRefs(store)

const handleConnectClick = () => {
    console.log("CLICK: " + settings.value.apiAddress)
    store.updateSettings({
      apiAddress: settings.value.apiAddress
    })

    // TODO: check connection, switch to status tab
  }

</script>
