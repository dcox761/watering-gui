<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Schedule</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content padding :fullscreen="true">
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
        <ion-card v-for="schedule in schedules">
          <ion-card-header>
            <ion-card-title>{{ formatDateTime(parseISODateTime(schedule["next_run"])) }}</ion-card-title>
            <ion-card-subtitle>{{ describeInterval(schedule) }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>{{ describePrograms(schedule) }}</ion-card-content>
          <ion-button fill="clear" @click="handleEditClick(schedule)">Edit</ion-button>
        </ion-card>
      </ion-list>
      <ion-grid v-else>
        <ion-row text-center>
          <ion-col>
            <ion-text>No schedules available.</ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-modal ref="editModal">
        <ion-content class="ion-padding" v-if="selected">
          <div class="ion-margin-top">
            <ion-datetime-button datetime="datetime"></ion-datetime-button>
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="datetime" presentation="date-time" v-model=selected_dtm
                :format-options="formatOptions"></ion-datetime></ion-modal>
            <!-- <p><ion-label>{{ describePrograms(selected) }}</ion-label></p> -->
            <ion-list v-for="program in listPrograms(selected)">
              <!-- TODO: selection list of programs -->
              <ion-item>
                <ion-label>{{ program }}</ion-label>
              </ion-item>
            </ion-list>
            <ion-button fill="clear" @click="handleCloseClick()">Close</ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { play, thermometerOutline } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonButton, IonNote, IonLoading,
  IonDatetime, IonDatetimeButton,
  IonGrid, IonRow, IonCol, IonText, IonModal,
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonRefresher, IonRefresherContent
} from '@ionic/vue';

import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"

const store = useStore()
const { settings, status, error } = storeToRefs(store)

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const formatOptions = {
  date: {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: '2-digit'
  },
  time: {
    hour: '2-digit',
    minute: '2-digit',
  },
};

const loading = ref()
const schedules = ref()
const selected = ref()
const selected_dtm = ref()
const editModal = ref()

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

const handleEditClick = async (schedule: any) => {
  console.log("handleEditClick")
  selected.value = schedule

  // ion-datetime does not change the timezone
  // parse and convert date to localtime
  const dateTime = parseISODateTime(schedule.next_run)
  if (dateTime) {
    // Use date-fns-tz to convert from UTC to a zoned time
    const zonedTime = utcToZonedTime(dateTime, userTimeZone)
    selected_dtm.value = format(zonedTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: userTimeZone });
  } else {
    selected_dtm.value = null
  }

  editModal.value.$el.present();
}

const handleCloseClick = async () => {
  console.log("handleCloseClick")

  const zonedTime = parseISODateTime(selected_dtm.value)
  if (zonedTime) {
    // toISOString automatically converts to UTC
    // Use date-fns-tz to convert from a zoned time to UTC
    //const dateTime = zonedTimeToUtc(zonedTime, userTimeZone)

    // this updates the Card automatically
    selected.value.next_run = zonedTime.toISOString()
  }
  selected_dtm.value = null
  selected.value = null
  editModal.value.$el.dismiss();
}

function initCaps(str: string, max_length: any = undefined) {
  return str[0].toUpperCase() + str.substring(1, max_length).toLowerCase();
}

const listPrograms = (schedule: any): string[] => {
  return schedule["kwargs"]["program"].split(",").sort()
}


const describePrograms = (schedule: any): string => {
  // add space after comma to allow wrap
  return schedule["kwargs"]["program"].replaceAll(",", ", ")
}

// nicely format interval
// eg. Daily, Every Sat, Every 2 Days
function describeInterval(schedule: any): string {
  var result = ""
  // TODO: it may be a one off!
  if (schedule.interval == 1) {
    if (schedule.unit == 'days') {
      result = "Daily"
    } else if (schedule.unit == 'weeks') {
      // var day_name = schedule.start_day
      // if (day_name) {
      //   day_name = initCaps(day_name, 3)
      // }
      // result = "Every " + day_name
      // TODO: next date may have been adjusted and not match the day_name
      result = "Weekly"
    }
  } else {
    // use Every to explain repeating. 2 Days could mean 2 days from now
    result = "Every " + schedule.interval + " " + initCaps(schedule.unit)
  }
  return result
}

// TODO: why is this called twice for each entry?
// TODO: it is also called each time any tab is selected
function parseISODateTime(dateTimeStr: string): Date | null {
  var result = null
  try {
    result = new Date(dateTimeStr)
  } catch (TypeError) {
    // ignore
  }
  return result
}

function formatDateTime(dateTime: Date | null) {
  var result = ""
  if (dateTime) {
    // result = dateTime.toLocaleString()
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    result = dateTime.toLocaleString(undefined, options)
  }
  return result
}

</script>
