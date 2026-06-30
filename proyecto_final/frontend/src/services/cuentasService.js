import cpApi from './cp_api.js'

export async function getCuentas() {
  const { data } = await cpApi.get('/api/cuentas')
  return data.cuentas
}

export async function getMovimientos(cuentaId) {
  const { data } = await cpApi.get(`/api/cuentas/${cuentaId}/movimientos`)
  return data
}

export async function depositar(cuentaId, monto, descripcion) {
  const { data } = await cpApi.post(`/api/cuentas/${cuentaId}/depositar`, { monto, descripcion })
  return data
}

export async function retirar(cuentaId, monto, descripcion) {
  const { data } = await cpApi.post(`/api/cuentas/${cuentaId}/retirar`, { monto, descripcion })
  return data
}
