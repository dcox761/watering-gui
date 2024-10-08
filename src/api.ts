import { Ref } from 'vue'
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
            store.clearError()
        })
        .catch(err => {
            console.log(err)
            status.value = null
            store.setError(`Error: ${err.message}`)
        })
}


/**
 * Send a GET/POST request to the API.
 * Use the loading component, if provided.
 * On success: 
 * - update status
 * - set Reference value
 * - optionally redirect to new URL
 * 
 * TODO: helper methods to save providing all parameters
 * 
 * @param path request path
 * @param method get (default get)/post
 * @param update_status (default true) to update status
 * @param loading optional Ref for IonLoading to present and dismiss
 * @param new_route optional new route URL
 * @param set_value optional Ref to store result data
 * @param data optional data to be sent in the request body (for POST requests)
 * @returns 
 */
export const apiRequest = async (path: string, method: string = 'get', update_status: boolean = true, 
    loading?: Ref, new_route?: string, set_value?: Ref, data?: any, callback?: (data: any) => void) => {
    // console.log(`postAction: ${action}`)
    // https://www.typescripttutorial.net/typescript-tutorial/typescript-optional-parameters/
    if (loading) {
        // .vue template can also use trigger 
        loading.value.$el.present()
    }

    const config: any = {
        method: method,
        url: `http://${settings.value.apiAddress}:5000/${path}`
    };

    if (method.toLowerCase() === 'post' && data) {
        config.data = JSON.stringify(data);
        config.headers = {
            'Content-Type': 'application/json'
        };
    }

    return axios(config)
        .then((resp) => {
            // console.log(resp)
            if (callback) {
                callback(resp.data);
            } else if (set_value) {
                set_value.value = resp.data
            }
            // TODO: improve API to return status with response and save this additional request
            if (update_status) {
                return updateStatus()
            }
        })
        .then(() => {
            if (new_route) {
                return router.push({ name: new_route })
            }
        })
        .catch((err) => {
            console.log(err)

            // keep the status set, it may just be a POST that failed
            // status.value = null

            store.setError(`Error: ${err.message}`)
        })
        .finally(() => {
            if (loading) {
                loading.value.$el.dismiss()
            }
        })
}