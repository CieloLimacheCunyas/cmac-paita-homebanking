import { useState, useEffect } from 'react'
import { getCuentas } from '../services/cuentasService.js'

export function useCuentas(autoRefresh = false) {
  const [cuentas,  setCuentas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const cargar = async () => {
    try {
      const data = await getCuentas()
      setCuentas(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al cargar cuentas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    if (autoRefresh) {
      const interval = setInterval(cargar, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return { cuentas, loading, error, recargar: cargar }
}