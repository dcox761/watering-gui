<template>
  <ion-toast
    :isOpen="!!error"
    :message="`${error}`"
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
const { error } = storeToRefs(store)

const clearError = () => {
  store.clearError()
}
</script>