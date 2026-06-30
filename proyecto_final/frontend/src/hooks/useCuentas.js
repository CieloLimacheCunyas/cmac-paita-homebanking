import { useState, useEffect } from 'react'
import { getCuentas } from '../services/cuentasService.js'

export function useCuentas() {
  const [cuentas,  setCuentas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await getCuentas()
      setCuentas(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al cargar cuentas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return { cuentas, loading, error, recargar: cargar }
}
