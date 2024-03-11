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
          <ion-button @click="handleConnectClick" id="connect-button">Connect</ion-button>
          <ion-loading ref="loading" trigger="connect-button" message="Connecting ..."/>
        </ion-item>
      </ion-list>
      <div>{{  status }}</div>
      <!-- <ExploreContainer name="Tab 1 page ..." /> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStore } from '../main'
  
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonList, IonItem, IonButton, IonLoading } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { ref } from 'vue'
import axios from "axios";
import { useRouter } from 'vue-router';

const store = useStore()
const { settings } = storeToRefs(store)
const status = ref()
const loading = ref()
const router = useRouter()    // lookup router here, not inside click handler (avoid TypeError: (intermediate value)() is undefined)

const handleConnectClick = async () => {
    // console.log("CLICK: " + settings.value.apiAddress)
    // store should already be updated by Pinia, just need to save to local storage
    store.save()
    // store.updateSettings({
    //   apiAddress: settings.value.apiAddress
    // })

    var connected = false
    try {
      // check connection
      // TODO: use then instead of await
      // TODO: simpler check connection API OR pass the data in another (non-persistent) Pinia store
      const { data } = await axios.get(`http://${settings.value.apiAddress}:5000/status`);
      status.value = data.log_size
      connected = true
    } catch (error:any) {
      console.log(error)
      status.value = `Unable to connect: ${error.message}`
    }
    // https://vuejs.org/guide/essentials/template-refs
    // Hint: the docs don't mention using $el
    loading.value.$el.dismiss()

    // Switch to status tab
    if (connected) {
      console.log(router)
      await router.push('/tabs/tab2')
    }
  }

</script>
