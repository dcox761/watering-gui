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
  const errorMsg = ref("")
  const ex = ref()

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

  const setError = (err: Error) => {
    errorMsg.value = `Error: ${err.message}`
    ex.value = err
  }

  const clearError = () => {
    errorMsg.value = ""
    ex.value = null
  }

  return {
    settings,
    status,
    errorMsg,
    ex,
    updateSettings,
    save,
    setError,
    clearError
  }
})
