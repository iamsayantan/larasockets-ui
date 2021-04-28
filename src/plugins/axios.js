import axios from 'axios'

export default function install(Vue, options = {}) {
    const scheme = options.tls === "true" ? 'https' : 'http'
    const axiosInstance = axios.create({
        baseURL: `${scheme}://${options.host}:${options.port}`
    })
    Vue.prototype.$axios = axiosInstance
}