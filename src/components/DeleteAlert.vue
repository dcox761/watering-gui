<template>
  <ion-alert :is-open="isOpen" :header="header" :message="message" :buttons="alertButtons"></ion-alert>
</template>

<script setup lang="ts">
import {
  IonAlert
} from '@ionic/vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  header: String,
  message: String,
  buttons: Array
});

const emit = defineEmits(['cancel', 'delete']);

const alertButtons = [
  {
    text: 'Cancel',
    role: 'cancel',
    handler: () => {
      emit('cancel');
    }
  },
  {
    text: 'Delete',
    role: 'destructive',
    handler: () => {
      emit('delete');
    }
  }
];
</script>