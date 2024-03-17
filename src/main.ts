import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

// https://runthatline.com/how-to-use-local-storage-pinia/
import { createPinia, defineStore } from 'pinia'
import axios from "axios";

const STORE_NAME = 'main'

const getDefaultSettings = () => ({
  apiAddress: null
})

const getSettings = () => {
  const settings = localStorage.getItem(STORE_NAME)

  return settings ? JSON.parse(settings) : getDefaultSettings()
}

// https://pinia.vuejs.org/core-concepts/
export const useStore = defineStore(STORE_NAME, {
  state: () => ({
    settings: getSettings(),
    status: null,
    error: ""
  }),
  actions: {
    updateSettings(partialSettings: any) {
      this.settings = {
        ...this.settings,
        ...partialSettings,
      }
      this.save()
    },
    async updateStatus() {
      // connect to API and retrieve status or set error
      try {
        // TODO: use then instead of await
        // TODO: add loading with spinner (needs to be handled by component)
        const { data } = await axios.get(`http://${this.settings.apiAddress}:5000/queue/status`);
        console.log(`store.updateStatus: ${this.settings.apiAddress}`)
        console.log(data)
        this.status = data
        this.error = ""
      } catch (error: any) {
        console.log(error)
        this.status = null
        this.error = `Unable to connect: ${error.message}`
      }
    },
    save() {
      localStorage.setItem(STORE_NAME, JSON.stringify(this.settings))
    },
  },
})

const pinia = createPinia()

const app = createApp(App)
  .use(pinia)
  .use(IonicVue)
  .use(router);
  
router.isReady().then(() => {
  app.mount('#app');
});