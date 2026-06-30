import { createContext, useState, useCallback, useMemo } from 'react'
import * as authService from '../services/authService.js'

export const HBAuthContext = createContext(null)

export function HBAuthProvider({ children }) {
  const [token, setToken] = useState(() => authService.getStoredToken())
  const [user,  setUser]  = useState(() => authService.getStoredUser())

  const login = useCallback(async (username, password) => {
    const { token: t, user: u } = await authService.login(username, password)
    authService.saveSession(t, u)
    setToken(t); setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    authService.clearSession()
    setToken(null); setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), login, logout }),
    [user, token, login, logout]
  )

  return <HBAuthContext.Provider value={value}>{children}</HBAuthContext.Provider>
}
