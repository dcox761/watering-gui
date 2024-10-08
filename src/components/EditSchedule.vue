<template>
  <ion-modal :is-open="isOpen" @ionModalDidDismiss="handleDismiss">
    <ion-content>
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ isEditing ? 'Edit Schedule' : 'New Schedule' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-grid>
        <ion-row>
          <ion-col><ion-label>Next Run:</ion-label></ion-col>
          <ion-col><ion-datetime-button datetime="datetime"></ion-datetime-button>
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="datetime" presentation="date-time" v-model=selected_dtm class="custom-datetime"
                :min="minDate" :max="maxDate" :format-options="formatOptions"></ion-datetime>
            </ion-modal>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col><ion-label>Repeat:</ion-label></ion-col>
          <ion-col>
            <ion-segment v-model=editRepeat>
              <ion-segment-button value="none">
                <ion-label>None</ion-label>
              </ion-segment-button>
              <ion-segment-button value="daily">
                <ion-label>Daily</ion-label>
              </ion-segment-button>
              <ion-segment-button value="weekly">
                <ion-label>Weekly</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-col>
        </ion-row>
        <ion-row v-if="editRepeat === 'daily'">
          <ion-col>
            <ion-select label="Interval:" v-model=editInterval>
              <ion-select-option v-for="n in 7" :key="n" :value="n">{{ n }}</ion-select-option>
            </ion-select>
          </ion-col>
        </ion-row>
        <ion-row v-if="editRepeat === 'weekly'">
          <ion-col>
            <ion-select label="Weekday:" v-model=editWeekday>
              <ion-select-option v-for="day in daysOfWeek" :key="day" :value="day.toLowerCase()">
                {{ day }}
              </ion-select-option>
            </ion-select>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-label>Programs:</ion-label>
            <ion-list :inset="true">
              <ion-item v-for="program in scheduledPrograms" :key="program.name">
                <ion-checkbox v-model="program.selected">{{ program.name }}</ion-checkbox>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button color="primary" @click="applyChanges">Apply</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import { format, toZonedTime } from 'date-fns-tz'
import {
  IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonDatetime, IonDatetimeButton,
  IonFooter, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonModal, IonRow,
  IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonTitle, IonToolbar
} from '@ionic/vue'

import { ref, watch } from 'vue'
import { parseISODateTime } from '../util'

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  schedule: Object,
  programs: Object
})

const emit = defineEmits(['close', 'apply'])

const selected_dtm = ref()      // ISO date time in local time zone for picker
const scheduledPrograms = ref() // all programs, selected for schedule
const editRepeat = ref()
const editInterval = ref()
const editWeekday = ref()

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const formatOptions = {
  date: {
    weekday: 'short' as 'short',
    month: 'short' as 'short',
    day: '2-digit' as '2-digit',
    year: '2-digit' as '2-digit'
  },
  time: {
    hour: '2-digit' as '2-digit',
    minute: '2-digit' as '2-digit',
  },
}

// Calculate the current date and the date 21 days from now
const today = new Date()
const maxDateObj = new Date()
maxDateObj.setDate(today.getDate() + 21)

// Format the dates to match the datetime-local input format
const formatDate = (date: Date) => {
  const pad = (num: number) => (num < 10 ? '0' + num : num)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const minDate = formatDate(today)
const maxDate = formatDate(maxDateObj)
// TODO: highlight other dates with schedule?

/**
 * Schedule object has been changed.
 * - convert ISO date/time to local timezone for date time picker
 * - prepare repeat, interval and weekday
 * - prepare list of selected programs
 */
watch(() => props.schedule, (schedule) => {
  if (schedule) {
    console.log('watch schedule', schedule)

    // ion-datetime does not change the timezone
    // parse and convert date to localtime
    const dateTime = parseISODateTime(schedule.next_run)
    // var dayOfWeek = 'monday'
    if (dateTime) {
      // Use date-fns-tz to convert from UTC to a zoned time
      const zonedTime = toZonedTime(dateTime, userTimeZone)
      selected_dtm.value = format(zonedTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: userTimeZone })
      // dayOfWeek = zonedTime.toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
      // console.log(dayOfWeek)
    } else {
      // should not happen
      selected_dtm.value = null
    }
    // editWeekday.value = schedule.start_day ? schedule.start_day : dayOfWeek

    const scheduledSet = getScheduledPrograms(schedule)
    // console.log(scheduledPrograms)
    const allPrograms = props.programs ? Object.keys(props.programs).sort() : []
    // console.log(allPrograms)
    scheduledPrograms.value = allPrograms.map((p) => {
      return { name: p, selected: scheduledSet.has(p) }
    })

    // console.log(schedule)
    if (schedule.cancel_after) {
      editRepeat.value = 'none'
    } else if (schedule.unit == 'days') {
      editRepeat.value = 'daily'
    } else if (schedule.unit == 'weeks') {
      editRepeat.value = 'weekly'
    }
    editInterval.value = schedule.interval ? schedule.interval : 1
  }
})

/**
 * Selected date/time has been changed.
 */
watch(selected_dtm, (newVal, oldVal) => {
  console.log(`selected_dtm changed from ${oldVal} to ${newVal}`)

  const newDate = parseISODateTime(newVal)
  if (newDate) {
    const weekday = newDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase()

    if (props.schedule) {
      if (props.schedule.new) {
        handleNewScheduleEntry(newDate, oldVal)
      } else {
        handleExistingScheduleEntry(weekday)
      }
    }
  }
})

function handleNewScheduleEntry(newDate: Date, oldVal: string) {
  const oldDate = parseISODateTime(oldVal)
  if (!oldDate || newDate.toDateString() !== oldDate.toDateString()) {
    editWeekday.value = newDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
  }
}

function handleExistingScheduleEntry(weekday: string) {
  editWeekday.value = props.schedule?.start_day ? props.schedule.start_day : weekday
}

interface Schedule {
  interval?: number
  new?: boolean
  start_day?: string
  kwargs?: {
    program?: string
  }
}

function getScheduledPrograms(schedule: Schedule): Set<string> {
  if (!schedule.kwargs || !schedule.kwargs.program) {
    return new Set<string>()
  }
  return new Set(schedule.kwargs.program.split(","))
}

function setScheduledPrograms(schedule: Schedule, programs: Set<string>) {
  if (!schedule.kwargs) {
    schedule.kwargs = { };
  }
  schedule.kwargs.program = Array.from(programs).join(",")
}

const closeModal = () => {
  emit('close')
}

const handleDismiss = () => {
  closeModal()
}

/**
 * Apply button on Modal dialog has been clicked.
 * - set next_run, adjusting for time zone
 * - set programs selected from the list
 * - adjust cancel_after, at_time, interval, unit and start_day
 * - close the dialog
 */
const applyChanges = () => {
  console.log("applyChanges")

  const schedule = props.schedule
  if (schedule) {
    const zonedTime = parseISODateTime(selected_dtm.value)
    if (zonedTime) {
      // toISOString automatically converts to UTC
      // Use date-fns-tz to convert from a zoned time to UTC
      //const dateTime = zonedTimeToUtc(zonedTime, userTimeZone)

      // TODO: check if time is in the past
      
      // this updates the Card automatically
      // format needs to be 2024-09-17T01:30:00+00:00
      schedule.next_run = zonedTime.toISOString().replace('Z', '+00:00')
      // this does not convert to UTC
      // schedule.next_run = format(zonedTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'UTC' }).replace('Z', '+00:00')
      console.log(schedule.next_run)

      // TODO: handle null scheduledPrograms.value
      // console.log(scheduledPrograms.value)
      const selectedPrograms = scheduledPrograms.value.filter((program: any) => {
        return program.selected
      })
      setScheduledPrograms(schedule, new Set(Object.values(selectedPrograms).map((program: any) => {
        return program.name
      })))

      if (editRepeat.value == 'none') {
        schedule.unit = "hours"
        schedule.interval = 1
        schedule.start_day = null
        const cancelAfterTime = new Date(zonedTime.getTime() + 10 * 60000);
        schedule.cancel_after = cancelAfterTime.toISOString().replace('Z', '+00:00');
      } else {

        // needed for micropython scheduler to calculate next_run
        const at_time = schedule.next_run.split('T')[1].split('+')[0];
        schedule.at_time = at_time;
        schedule.cancel_after = null

        if (editRepeat.value == 'daily') {
          schedule.unit = 'days'
          schedule.interval = Number(editInterval.value)
          schedule.start_day = null
        } else if (editRepeat.value == 'weekly') {
          schedule.unit = 'weeks'
          schedule.interval = 1
          schedule.start_day = editWeekday.value
        }
      }

      emit('apply', {})
    }
  }
  closeModal()
}

</script>

<style scoped>
/* border around datetime picker */
.custom-datetime {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>