<template>
  <ion-toast
    :isOpen="!!errorMsg"
    :message="`${errorMsg}`"
    duration="0"
    position="top"
    :buttons="[{ text: 'Dismiss', handler: clearError }]"
  />
</template>

<script setup lang="ts">
import { IonToast } from '@ionic/vue'
import { storeToRefs } from 'pinia'
import { useStore } from '../store'

const store = useStore()
const { errorMsg } = storeToRefs(store)

const clearError = () => {
  store.clearError()
}
</script>