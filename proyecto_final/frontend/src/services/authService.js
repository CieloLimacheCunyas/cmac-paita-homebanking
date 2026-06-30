import cpApi, { TOKEN_KEY, USER_KEY } from './cp_api.js'

export async function login(username, password) {
  const { data } = await cpApi.post('/api/auth/login', { username, password })
  return { token: data.accessToken, user: data.usuario }
}

export async function registro(datos) {
  const { data } = await cpApi.post('/api/auth/registro', datos)
  return { token: data.accessToken, user: data.usuario }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredToken() { return localStorage.getItem(TOKEN_KEY) }

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
