import { useContext } from 'react'
import { HBAuthContext } from '../context/HBAuthContext.jsx'

export function useHBAuth() {
  const ctx = useContext(HBAuthContext)
  if (!ctx) throw new Error('useHBAuth debe usarse dentro de HBAuthProvider')
  return ctx
}
