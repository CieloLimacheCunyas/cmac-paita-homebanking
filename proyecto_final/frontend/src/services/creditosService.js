
import cpApi from './cp_api.js'

export const getMisCreditos    = async () => { const { data } = await cpApi.get('/api/creditos/mis-creditos'); return data.creditos }
export const getCuotas         = async (id) => { const { data } = await cpApi.get(`/api/creditos/${id}/cuotas`); return data.cuotas }
export const solicitarCredito  = async (datos) => { const { data } = await cpApi.post('/api/creditos/solicitar', datos); return data }
export const getMisSolicitudes = async () => { const { data } = await cpApi.get('/api/creditos/mis-solicitudes'); return data.solicitudes }

// Core
export const getBandeja    = async (estado) => { const { data } = await cpApi.get('/api/creditos/bandeja', { params: { estado } }); return data.solicitudes }
export const getDetalle    = async (id) => { const { data } = await cpApi.get(`/api/creditos/bandeja/${id}`); return data.solicitud }
export const evaluar       = async (id, datos) => { const { data } = await cpApi.put(`/api/creditos/${id}/evaluar`, datos); return data }
export const aprobar       = async (id, datos) => { const { data } = await cpApi.put(`/api/creditos/${id}/aprobar`, datos); return data }
export const rechazar      = async (id, datos) => { const { data } = await cpApi.put(`/api/creditos/${id}/rechazar`, datos); return data }
export const desembolsar   = async (id) => { const { data } = await cpApi.post(`/api/creditos/${id}/desembolsar`); return data }

// Mora
export const getCarteraMora      = async () => { const { data } = await cpApi.get('/api/creditos/mora/cartera'); return data.cartera }
export const registrarGestion    = async (id, datos) => { const { data } = await cpApi.post(`/api/creditos/mora/${id}/gestion`, datos); return data }
export const getHistorial        = async (id) => { const { data } = await cpApi.get(`/api/creditos/mora/${id}/historial`); return data.gestiones }
export const transicionarEstado  = async (id, estado) => { const { data } = await cpApi.put(`/api/creditos/mora/${id}/transicion`, { estado }); return data }
