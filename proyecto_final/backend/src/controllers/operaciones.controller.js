
const repo = require('../services/transferencias.repository')

const transferir = async (req, res) => {
  try {
    const { cuenta_origen_id, numero_cuenta_destino, monto, descripcion } = req.body
    if (!cuenta_origen_id || !numero_cuenta_destino || !monto)
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    if (monto <= 0) return res.status(400).json({ error: 'Monto invalido' })
    const data = await repo.transferir({
      cuentaOrigenId: parseInt(cuenta_origen_id),
      personaId: req.usuario.personaId,
      numeroCuentaDestino: numero_cuenta_destino,
      monto: parseFloat(monto),
      descripcion
    })
    res.json({ mensaje: 'Transferencia realizada exitosamente', ...data })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

const pagarCuota = async (req, res) => {
  try {
    const { cuenta_id, cuota_id } = req.body
    if (!cuenta_id || !cuota_id) return res.status(400).json({ error: 'Faltan datos' })
    const data = await repo.pagarCuota({
      cuentaId: parseInt(cuenta_id),
      personaId: req.usuario.personaId,
      cuotaId: parseInt(cuota_id)
    })
    res.json({ mensaje: 'Cuota pagada exitosamente', ...data })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

module.exports = { transferir, pagarCuota }
