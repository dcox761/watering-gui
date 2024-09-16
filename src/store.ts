import { defineStore } from 'pinia'

const STORE_NAME = 'main'

const getDefaultSettings = () => ({
  apiAddress: null
})

const getSettings = () => {
  const settings = localStorage.getItem(STORE_NAME)

  return settings ? JSON.parse(settings) : getDefaultSettings()
}

// TODO: change to composition API
// https://pinia.vuejs.org/core-concepts/
// https://runthatline.com/how-to-use-local-storage-pinia/
export const useStore = defineStore(STORE_NAME, {
  state: () => ({
    settings: getSettings(),

    // used by api.ts
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
    save() {
      localStorage.setItem(STORE_NAME, JSON.stringify(this.settings))
    },
    setError(message: string) {
      this.error = message
    },
    clearError() {
      this.error = ""
    }
  },
})
