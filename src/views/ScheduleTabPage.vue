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
          :key="schedule.next_run">
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
  return apiRequest('schedule', undefined, false,
    loading, undefined, schedules).then(() => {
      sortSchedules(schedules)
    })
}

const sortSchedules = (schedules: any) => {
  // sort results by next run
  // Result may be Error (eg: if memory allocation failed)
  const { compare } = Intl.Collator('en-US')
  const results = schedules.value
  if (results) {
    console.log(results)
    if (Array.isArray(results)) {
      results.sort((a, b) => compare(a.next_run, b.next_run))
      schedules.value = results
    }
  } else {
    console.log(error.value)
  }
}

const addSchedule = (schedules: any, schedule: any) => {
  // TODO: or refresh instead?
  schedules.value.push(schedule)
  sortSchedules(schedules)
}

const updatePrograms = async () => {
  console.log('updatePrograms')
  return apiRequest('programs', undefined, false,
    loading, undefined, programs)
}

const handleRefresh = async (event: CustomEvent) => {
  console.log('handleRefresh')
  return updateSchedules()
    .then(() => {
      if (event.target) {
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
    // TODO: re-sort the schedule
  } else {
    // Add the new schedule
    if (currentSchedule.value && currentSchedule.value.new) {
      delete currentSchedule.value.new
      addSchedule(schedules, currentSchedule.value)
    }
  }
  // TODO: upload changes (if any)
}

const handleSkipClick = async (schedule: any) => {
  // TODO: skip to tomorrow or next schedule?
  console.log("TODO handleSkipClick")
  closeSlidingItem()
}

const presentDeleteConfirm = (schedule: any) => {
  selected.value = schedule
  isDeleteAlertOpen.value = true
}

const handleDeleteClick = async (schedule: any) => {
  console.log('Delete schedule:', schedule)
  schedules.value = schedules.value.filter((s: any) => s !== schedule)
  // TODO: upload schedule if changed
}

const closeSlidingItem = () => {
  const slidingItem = document.querySelector('ion-item-sliding')
  if (slidingItem) {
    slidingItem.closeOpened()
  }
}

const handleAddClick = () => {
  console.log("handleAddClick")

  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)

  const newSchedule = {
    id: Date.now(), // or any unique identifier
    next_run: now.toISOString(),
    interval: 0,
    unit: 'days',
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
  if (schedule.interval == 0) {
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