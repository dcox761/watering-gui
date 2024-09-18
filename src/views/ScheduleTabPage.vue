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
      <ion-loading ref="loading" />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>
      <ion-grid>
        <ion-row v-if="Array.isArray(schedules) && schedules.length > 0" v-for="schedule in schedules"
          :key="schedule.id">
          <ion-col size="12">
            <ion-item-sliding>
              <ion-item>
                <ion-card class="full-width-card">
                  <ion-card-header>
                    <ion-card-title>{{ formatDateTime(parseISODateTime(schedule["next_run"])) }}</ion-card-title>
                    <ion-card-subtitle>{{ describeInterval(schedule) }}</ion-card-subtitle>
                  </ion-card-header>
                  <ion-card-content>{{ describePrograms(schedule) }}</ion-card-content>
                </ion-card>
              </ion-item>
              <ion-item-options side="end">
                <ion-item-option color="primary" @click="openEditModal(true, schedule)">
                  Edit
                </ion-item-option>
                <ion-item-option color="warning" @click="handleSkipClick(schedule)">
                  Skip
                </ion-item-option>
                <ion-item-option color="danger" @click="presentDeleteConfirm(schedule)">
                  Delete
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-col>
        </ion-row>
        <ion-row v-else>
          <ion-col text-center>
            <ion-text>No schedules available.</ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="handleAddClick">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <EditSchedule :isOpen="isEditModalOpen" :isEditing="isEditing" :schedule="currentSchedule" :programs="programs"
        @close="closeEditModal" @apply="handleApply" />
      <DeleteAlert :isOpen="isDeleteAlertOpen" header="Confirm Delete"
        message="Are you sure you want to delete this schedule?" @cancel="isDeleteAlertOpen = false"
        @delete="handleDeleteClick(selected); isDeleteAlertOpen = false" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { add } from "ionicons/icons"
import { addIcons } from 'ionicons'
import {
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem,
  IonItemOption, IonItemOptions, IonItemSliding, IonLoading, IonPage, IonRefresher,
  IonRefresherContent, IonRow, IonText, IonTitle, IonToolbar
} from '@ionic/vue'

import { v4 as uuidv4 } from 'uuid';
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'
import { apiRequest } from "../api"
import { parseISODateTime, formatDateTime } from '../util'

import EditSchedule from '@/components/EditSchedule.vue'
import DeleteAlert from '@/components/DeleteAlert.vue'

// Register the add icon
addIcons({
  add
})

const store = useStore()
const { error } = storeToRefs(store)

const isEditModalOpen = ref(false)
const isEditing = ref(false)
const currentSchedule = ref()

const loading = ref()
const schedules = ref()
const programs = ref()
const selected = ref()      // selected schedule
const isDeleteAlertOpen = ref(false)

onMounted(async () => {
  console.log('onMounted')
  if (!schedules.value) {
    // TODO: also if address changes
    await updateSchedules()
  }

  if (!programs.value) {
    await updatePrograms()
  }
})

const updateSchedules = async () => {
  console.log('updateSchedules')
  // TODO: rename API to schedules
  // TODO: or should result be returned instead of callback?
  return apiRequest('schedule', undefined, false,
    loading, undefined, undefined, undefined, (data: any) => {
      sortSchedules(data)
    })
}

const postSchedules = async () => {
  console.log('postSchedules')
  // TODO: rename API to schedules
  return apiRequest('schedule', 'post', false,
    loading, undefined, undefined, schedules.value).then(() => {
      // TODO: check for error?
      console.log('completed')
    })

  // TODO: refresh?
  // TODO: optimistic locking with version check?
}

// NOTE: This sets the reactive value for schedules
const sortSchedules = (data: any) => {
  console.log('sortSchedules:', data)
  // sort results by next run
  // Result may be Error (eg: if memory allocation failed)
  const { compare } = Intl.Collator('en-US')
  const results = data
  if (results) {
    if (Array.isArray(results)) {
      results.sort((a, b) => compare(a.next_run, b.next_run))
      results.forEach((result, index) => {
        result.id = index + 1;
      });
      schedules.value = results
    }
  } else {
    schedules.value = []
    console.log(error.value)
  }
}

const addSchedule = (schedules: any, schedule: any) => {
  // TODO: or refresh instead?
  // TODO: inconsistent use of .value
  const new_schedules = schedules.value
  delete currentSchedule.value.new
  new_schedules.push(schedule)
  sortSchedules(new_schedules)
}

const updatePrograms = async () => {
  console.log('updatePrograms')
  return apiRequest('programs', undefined, false,
    loading, undefined, programs)
}

const handleRefresh = async (event?: CustomEvent) => {
  console.log('handleRefresh')
  return updateSchedules()
    .then(() => {
      if (event?.target) {
        (event.target as HTMLIonRefresherElement).complete()
      }
    })

  // TODO: update programs too?
}

const openEditModal = (isEditingValue: boolean, schedule: any = null) => {
  closeSlidingItem()
  isEditing.value = isEditingValue
  currentSchedule.value = schedule
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const handleApply = async (updatedSchedule: any) => {
  console.log('handleApply', updatedSchedule)
  if (isEditing.value) {
    // Update the existing schedule
  } else if (currentSchedule.value && currentSchedule.value.new) {
    // Add the new schedule
    addSchedule(schedules, currentSchedule.value)
  }
  await postSchedules()
  await handleRefresh()
}


const handleSkipClick = async (schedule: any) => {
  // TODO: show current date and time in header? (or time on unit from API)
  console.log("handleSkipClick")
  closeSlidingItem()

  // if more than 7 days away, it subtracts 1 week
  // need to calculate next_run as the next selected weekday after current schedule at specific time
  if (schedule.unit === 'weeks') {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const startDayIndex = daysOfWeek.indexOf(schedule.start_day);
    console.log('startDayIndex:', startDayIndex);
    const nextRunDate = parseISODateTime(schedule.next_run);
    if (startDayIndex !== -1 && nextRunDate) {
      console.log('Current next_run:', schedule.next_run);
      console.log('Parsed nextRunDate:', nextRunDate);

      const currentDayIndex = nextRunDate.getDay();
      const daysToAdd = (startDayIndex + 7 - currentDayIndex) % 7 || 7;
      nextRunDate.setDate(nextRunDate.getDate() + daysToAdd);
      console.log('Adjusted nextRunDate after setting day:', nextRunDate);

      const [hours, minutes] = schedule.at_time.split(':').map(Number);
      console.log('Parsed hours and minutes:', hours, minutes);

      // Convert GMT time to local time
      nextRunDate.setUTCHours(hours, minutes, 0, 0);
      console.log('Final nextRunDate after setting time:', nextRunDate);

      schedule.next_run = nextRunDate.toISOString().replace('Z', '+00:00');
      console.log('Updated schedule.next_run:', schedule.next_run);
    }
  } else {
    // works for Daily, not Weekly
    schedule.last_run = schedule.next_run
    schedule.next_run = null
  }
  await postSchedules()
  await handleRefresh()
}

const presentDeleteConfirm = (schedule: any) => {
  selected.value = schedule
  isDeleteAlertOpen.value = true
}

const handleDeleteClick = async (schedule: any) => {
  console.log('Delete schedule:', schedule)
  schedules.value = schedules.value.filter((s: any) => s !== schedule)
  await postSchedules()
}

const closeSlidingItem = () => {
  const slidingItem = document.querySelector('ion-item-sliding')
  if (slidingItem) {
    slidingItem.closeOpened()
  }
}

const handleAddClick = () => {
  console.log("handleAddClick")

  const next_hour = new Date()
  next_hour.setMinutes(0, 0, 0)
  next_hour.setHours(next_hour.getHours() + 1)
  const next_hour_iso = next_hour.toISOString()

  // TODO: pass blank instead and create with EditSchedule? but EditSchedule watches props.schedule
  // TODO: API should be simpler, ie. it should handle required fields
  const newSchedule = {
    // id not required, will be added by sortSchedules
    next_run: next_hour_iso,
    interval: 1,
    latest: null, // required to prevent error
    cancel_after: next_hour_iso, 
    args: [], // required to prevent error
    job_func_name: "queue_program",
    unit: 'hours',
    kwargs: {
      program: ''
    },
    new: true
  }

  openEditModal(false, newSchedule)
}

function initCaps(str: string, max_length: any = undefined) {
  return str[0].toUpperCase() + str.substring(1, max_length).toLowerCase()
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
  if (schedule.cancel_after) {
    result = "One off"
  } else if (schedule.interval == 1) {
    if (schedule.unit == 'days') {
      result = "Daily"
    } else if (schedule.unit == 'weeks') {
      var day_name = schedule.start_day
      if (day_name) {
        // day_name = initCaps(day_name, 3)
        day_name = initCaps(day_name)
      }
      result = "Every " + day_name
      // TODO: next date may have been adjusted and not match the day_name
      // result = "Weekly"
    }
  } else {
    // use Every to explain repeating. 2 Days could mean 2 days from now
    result = "Every " + schedule.interval + " " + initCaps(schedule.unit)
  }
  return result
}

</script>

<style scoped>
.full-width-card {
  width: 100%;
}
</style>