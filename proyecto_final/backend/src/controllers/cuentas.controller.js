const repo = require('../services/cuentas.repository')

const listar = async (req, res) => {
  try {
    const cuentas = await repo.getCuentasByPersona(req.usuario.personaId)
    res.json({ cuentas })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const movimientos = async (req, res) => {
  try {
    const { id } = req.params
    const data = await repo.getMovimientos(parseInt(id), req.usuario.personaId)
    if (!data) return res.status(404).json({ error: 'Cuenta no encontrada' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const depositar = async (req, res) => {
  try {
    const { id } = req.params
    const { monto, descripcion } = req.body
    if (!monto || monto <= 0) return res.status(400).json({ error: 'Monto invalido' })
    const data = await repo.depositar(parseInt(id), req.usuario.personaId, monto, descripcion)
    res.json({ mensaje: 'Deposito realizado exitosamente', ...data })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

const retirar = async (req, res) => {
  try {
    const { id } = req.params
    const { monto, descripcion } = req.body
    if (!monto || monto <= 0) return res.status(400).json({ error: 'Monto invalido' })
    const data = await repo.retirar(parseInt(id), req.usuario.personaId, monto, descripcion)
    res.json({ mensaje: 'Retiro realizado exitosamente', ...data })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

module.exports = { listar, movimientos, depositar, retirar }
