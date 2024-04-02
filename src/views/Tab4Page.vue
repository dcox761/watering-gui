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
        <ion-card v-for="schedule in schedules">
          <ion-card-header>
            <ion-card-title>{{ formatDateTime(parseISODateTime(schedule["next_run"])) }}</ion-card-title>
            <ion-card-subtitle>{{ describeInterval(schedule) }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>{{ describePrograms(schedule) }}</ion-card-content>
          <ion-button fill="clear" @click="handleEditClick(schedule)">Edit</ion-button>
          <ion-button fill="clear" @click="handleSkipClick(schedule)">Skip</ion-button>
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
          <ion-grid>
            <ion-row>
              <ion-col class="ion-padding-vertical ion-padding-start">Next Run:</ion-col>
              <ion-col><ion-datetime-button datetime="datetime"></ion-datetime-button>
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime id="datetime" presentation="date-time" v-model=selected_dtm
                    color="dark"
                    :format-options="formatOptions"></ion-datetime></ion-modal>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col class="ion-padding-vertical ion-padding-start">Programs:</ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <!-- TODO: Reduce space between items -->
                <ion-list :inset="true" v-for="program in scheduledPrograms">
                  <ion-item>
                    <ion-checkbox v-model="program.selected">{{ program.name }}</ion-checkbox>
                  </ion-item>
                </ion-list>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <ion-button fill="clear" @click="handleApplyClick()">Apply</ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { diceOutline, play, thermometerOutline } from "ionicons/icons";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonIcon, IonButton, IonNote, IonLoading, IonCheckbox,
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
const programs = ref()
const selected = ref()      // selected schedule
const selected_dtm = ref()  // ISO date time in local time zone for picker
const scheduledPrograms = ref() // all programs, selected for schedule
const editModal = ref()     // modal dialog

onMounted(async () => {
  console.log('onMounted')
  if (!schedules.value) {
    // TODO: also if address changes
    await updateSchedules()
  }
  // if (!programs.value) {
  //   await updatePrograms()
  // }
})

const updatePrograms = async () => {
  console.log('updatePrograms')
  return apiRequest('programs', undefined, false,
    loading, undefined, programs)
}

const updateSchedules = async () => {
  console.log('updateSchedules')
  // TODO: rename API to schedules
  return apiRequest('schedule', undefined, false,
    loading, undefined, schedules).then(() => {

      // sort results by next run
      // Result may be Error (eg: if memory allocation failed)
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

const handleSkipClick = async (schedule: any) => {
  console.log("handleSkipClick")

}

/**
 * Edit button on a Card has been clicked.
 * - set selected object
 * - convert ISO date/time to local timezone for date time picker
 * - prepare list of selected programs
 * - show modal dialog
 */
const handleEditClick = async (schedule: any) => {
  console.log("handleEditClick")
  await updatePrograms()

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

  const scheduledSet = getScheduledPrograms(schedule)
  // console.log(scheduledPrograms)
  const allPrograms = Object.keys(programs.value).sort()
  // console.log(allPrograms)
  scheduledPrograms.value = allPrograms.map((p) => {
    return { name: p, selected: scheduledSet.has(p) } 
  });

  editModal.value.$el.present();
}

function getScheduledPrograms(schedule: any): Set<any> {
  return new Set(schedule["kwargs"]["program"].split(","))
}

function setScheduledPrograms(schedule: any, programs: Set<any>) {
  schedule["kwargs"]["program"] = Array.from(programs).join(",")
}

/**
 * Apply button on Modal dialog has been clicked.
 * - set next_run, adjusting for time zone
 * - set programs selected from the list
 * - clear selected object
 * - close the dialog
 */
const handleApplyClick = async () => {
  console.log("handleApplyClick")

  const zonedTime = parseISODateTime(selected_dtm.value)
  if (zonedTime) {
    // toISOString automatically converts to UTC
    // Use date-fns-tz to convert from a zoned time to UTC
    //const dateTime = zonedTimeToUtc(zonedTime, userTimeZone)

    // this updates the Card automatically
    selected.value.next_run = zonedTime.toISOString()
  }

  // console.log(scheduledPrograms.value)
  const selectedPrograms = scheduledPrograms.value.filter((program: any) => {
    return program.selected
  })
  setScheduledPrograms(selected.value, new Set(Object.values(selectedPrograms).map((program: any) => {
    return program.name
  })))

  selected_dtm.value = null
  selected.value = null
  editModal.value.$el.dismiss();
}

function initCaps(str: string, max_length: any = undefined) {
  return str[0].toUpperCase() + str.substring(1, max_length).toLowerCase();
}

function describePrograms(schedule: any): string {
  // add space after comma to allow wrap
  return schedule["kwargs"]["program"].replaceAll(",", ", ")
}

/**
 * Nicely format interval.
 * 
 * eg. Daily, Every Sat, Every 2 Days
 */
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

// TODO: set min max time min="2022-03-01T00:00:00" max="2022-05-31T23:59:59"
// TODO: highlight other dates with schedule
</script>


<style>
  /* Make the nested modal datetime stand out 
    Does not work on iOS Safari, can't see calendar
  */
  /* ion-datetime {
    --background: #fff1f2;
    --background-rgb: 255, 241, 242;

    border-radius: 16px;
    box-shadow: 0px 10px 15px 3px;
  } */

  /* Hack: remove spacing between list items - https://stackoverflow.com/questions/60365916/remove-spacing-in-ion-list 
    Does not work on iOS Safari, lines are too small
  */
  /* ion-item {
    margin-top: -20px; 
    margin-bottom: -20px; 
  } */
</style>