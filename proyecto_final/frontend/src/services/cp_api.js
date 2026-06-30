import axios from 'axios'

export const TOKEN_KEY = 'cp_token'
export const USER_KEY  = 'cp_user'

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001'

const cpApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Inyecta Bearer token en cada request
cpApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Ante 401: limpia sesion y redirige a /login
cpApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const enLogin = window.location.pathname.startsWith('/login')
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!enLogin) window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export default cpApi
