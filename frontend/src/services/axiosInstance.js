import axios from 'axios'

const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : 'http://localhost:4000'

const axiosInstance = axios.create({
  baseURL: base
})

// Add token to requests
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('gamingstore_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    return config
  },
  error => Promise.reject(error)
)

// Add response interceptor to handle 401s
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear local storage on 401 Unauthorized
      localStorage.removeItem('gamingstore_token')
      localStorage.removeItem('gamingstore_user')

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
