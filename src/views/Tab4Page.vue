<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Schedule</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Schedule</ion-title>
        </ion-toolbar>
      </ion-header>
      <div>{{ error }}</div>
      <ion-loading ref="loading" />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      <ion-list v-if="Array.isArray(schedules) && schedules.length > 0">
        <!-- TODO: sort -->
        <ion-item v-for="schedule in schedules">
          <ion-label>{{ parseDate(schedule["next_run"]) }}</ion-label>
          <ion-note class="ion-text-wrap ion-text-right">{{ schedule["kwargs"]["program"] }}</ion-note>
        </ion-item>
      </ion-list>
      <IonText v-else>No schedules available.</IonText>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { play, thermometerOutline } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonButton, IonNote, IonLoading, IonText,
  IonRefresher, IonRefresherContent
} from '@ionic/vue';

import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"

const store = useStore()
const { settings, status, error } = storeToRefs(store)

const loading = ref()
const schedules = ref()

onMounted(async () => {
  if (!schedules.value) {
    console.log('onMounted')
    // TODO: also if address changes
    await updateSchedules()
  }
})

const updateSchedules = async () => {
  console.log('updateSchedules')
  // TODO: rename API to schedules
  return apiRequest('schedule', undefined, false,
    loading, undefined, schedules).then(() => {

      // sort results by next run
      // TODO: sometimes the result is not an array on second refresh and works again after a few more attempts
      // Result may be Error (eg: if memory allocation failed)
      // TODO: API should return error code too
      const { compare } = Intl.Collator('en-US')
      const results = schedules.value
      console.log(results)
      if (Array.isArray(results)) {
        results.sort((a, b) => compare(a.next_run, b.next_run))
        schedules.value = results
      }
    })
}

const handleRefresh = async (event: CustomEvent) => {
  console.log('handleRefresh')
  return updateSchedules()
    .then(() => {
      if (event.target) {
        event.target.complete()
      }
    })
}

// TODO: why is this called twice for each entry?
const parseDate = (dateStr: string): string => {
  var result = ""
  try {
    const date = new Date(dateStr)
    console.log(date.toISOString())
    result = date.toLocaleString()
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    result = date.toLocaleString(undefined, options)
  } catch (TypeError) {
    // ignore
  }
  return result
}

</script>

