export function toNumber(v) {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

export function formatMoney(v, simbolo = 'S/') {
  return `${simbolo} ${toNumber(v).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function extractError(err, fallback = 'Ocurrio un error') {
  return err?.response?.data?.error || err?.response?.data?.detail || err?.message || fallback
}
