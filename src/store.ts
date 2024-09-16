import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORE_NAME = 'main'

const getDefaultSettings = () => ({
  apiAddress: null
})

const getSettings = () => {
  const settings = localStorage.getItem(STORE_NAME)
  return settings ? JSON.parse(settings) : getDefaultSettings()
}

export const useStore = defineStore(STORE_NAME, () => {
  const settings = ref(getSettings())
  const status = ref(null)
  const error = ref("")

  const updateSettings = (partialSettings: any) => {
    settings.value = {
      ...settings.value,
      ...partialSettings,
    }
    save()
  }

  const save = () => {
    localStorage.setItem(STORE_NAME, JSON.stringify(settings.value))
  }

  const setError = (message: string) => {
    error.value = message
  }

  const clearError = () => {
    error.value = ""
  }

  return {
    settings,
    status,
    error,
    updateSettings,
    save,
    setError,
    clearError
  }
})
