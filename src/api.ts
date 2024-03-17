import { storeToRefs } from 'pinia'
import { useStore } from './store'
import axios from "axios"
import router from './router/index'

const store = useStore()
const { settings, status, error } = storeToRefs(store)

/*
Hint: router
In a .vue file:
import { useRouter } from 'vue-router'
const router = useRouter() 
*/

/**
 * Retrieve status from the API.
 * 
 * @returns 
 */
export const updateStatus = async () => {
    // connect to API and retrieve status or set error
    console.log(`store.updateStatus: ${settings.value.apiAddress}`)

    // TODO: add loading with spinner (needs to be handled by component)
    return axios.get(`http://${settings.value.apiAddress}:5000/queue/status`)
        .then(resp => {
            console.log(resp)
            status.value = resp.data
            error.value = ""
        })
        .catch(err => {
            console.log(err)
            status.value = null
            error.value = `Unable to connect: ${err.message}`
        })
}


/**
 * POST an action to the API.
 * Use the loading component, if provided.
 * On success, update status and redirect to optional new URL.
 * 
 * @param action POST action
 * @param loading optional IonLoading to present and dismiss
 * @param new_route optional new URL
 * @returns 
 */
export const apiAction = async (action: string, loading?: any, new_route?: string) => {
    // console.log(`postAction: ${action}`)
    if (loading) {
        loading.$el.present()
    }
    return axios.post(`http://${settings.value.apiAddress}:5000/${action}`)
        .then((data) => {
            // console.log(data)
            return updateStatus()
        })
        .then(() => {
            if (new_route) {
                router.push(new_route)
            }
        })
        .catch((err) => {
            console.log(err)
            // TODO: format error nicely, red/centered, ion-toast?
            error.value = `Error: ${err.message}`
        })
        .finally(() => {
            if (loading) {
                loading.$el.dismiss()
            }
        })
}