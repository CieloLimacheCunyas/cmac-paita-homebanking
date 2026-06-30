
import cpApi from './cp_api.js'

export const transferir = async (datos) => { const { data } = await cpApi.post('/api/operaciones/transferir', datos); return data }
export const pagarCuota = async (datos) => { const { data } = await cpApi.post('/api/operaciones/pagar-cuota', datos); return data }
