<template>
  <ion-app>
    <GlobalError />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import GlobalError from './components/GlobalError.vue';
</script>
