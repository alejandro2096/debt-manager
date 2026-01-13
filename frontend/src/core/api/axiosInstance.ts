import axios, { AxiosError } from 'axios'
import { ENV } from '@/core/config/env'
import { clearToken, getToken } from '@/core/auth/tokenStorage'
import { ROUTES } from '@/app/router/routes'

export const axiosInstance = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            clearToken()

            const path = window.location.pathname
            if (path !== ROUTES.login && path !== ROUTES.register) {
                window.location.assign(ROUTES.login)
            }
        }

        return Promise.reject(error)
    },
)
