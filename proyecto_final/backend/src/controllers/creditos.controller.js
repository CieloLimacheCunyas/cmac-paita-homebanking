
const repo = require('../services/creditos.repository')

// ── Homebanking ────────────────────────────────────────────
const misCreditos = async (req, res) => {
  try {
    const data = await repo.getCreditosByPersona(req.usuario.personaId)
    res.json({ creditos: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const cuotas = async (req, res) => {
  try {
    const data = await repo.getCuotasByCredito(parseInt(req.params.id), req.usuario.personaId)
    if (!data) return res.status(404).json({ error: 'Credito no encontrado' })
    res.json({ cuotas: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const solicitar = async (req, res) => {
  try {
    const { monto, plazo_meses, con_seguro, proposito } = req.body
    if (!monto || !plazo_meses) return res.status(400).json({ error: 'Faltan datos' })
    if (monto < 500 || monto > 30000) return res.status(400).json({ error: 'Monto entre S/500 y S/30,000' })
    if (![6,12,18,24,36].includes(parseInt(plazo_meses))) return res.status(400).json({ error: 'Plazo: 6,12,18,24 o 36 meses' })
    const sol = await repo.crearSolicitud({
      personaId: req.usuario.personaId,
      monto: parseFloat(monto),
      plazoMeses: parseInt(plazo_meses),
      conSeguro: !!con_seguro,
      proposito
    })
    res.status(201).json({ mensaje: 'Solicitud enviada exitosamente', solicitud: sol })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

const misSolicitudes = async (req, res) => {
  try {
    const data = await repo.getMisSolicitudes(req.usuario.personaId)
    res.json({ solicitudes: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

// ── Core Bancario ──────────────────────────────────────────
const bandeja = async (req, res) => {
  try {
    const data = await repo.getBandeja(req.query.estado)
    res.json({ solicitudes: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const detalle = async (req, res) => {
  try {
    const data = await repo.getSolicitudById(parseInt(req.params.id))
    if (!data) return res.status(404).json({ error: 'No encontrado' })
    res.json({ solicitud: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const evaluar = async (req, res) => {
  try {
    const { scoring, rds, obs } = req.body
    await repo.evaluarSolicitud(parseInt(req.params.id), { scoring, rds, obs, usuarioId: req.usuario.id })
    res.json({ mensaje: 'Evaluacion registrada' })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

const aprobar = async (req, res) => {
  try {
    const { obs } = req.body
    await repo.aprobarAdmin(parseInt(req.params.id), { obs, usuarioId: req.usuario.id })
    res.json({ mensaje: 'Solicitud aprobada' })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

const rechazar = async (req, res) => {
  try {
    const { obs } = req.body
    await repo.rechazarSolicitud(parseInt(req.params.id), { obs, usuarioId: req.usuario.id })
    res.json({ mensaje: 'Solicitud rechazada' })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

const desembolsar = async (req, res) => {
  try {
    const cred = await repo.desembolsar(parseInt(req.params.id), req.usuario.id)
    res.json({ mensaje: 'Credito desembolsado exitosamente', credito: cred })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

// ── Mora ───────────────────────────────────────────────────
const carteraMora = async (req, res) => {
  try {
    const data = await repo.getCarteraMora()
    res.json({ cartera: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const registrarGestion = async (req, res) => {
  try {
    const { tipo, descripcion, resultado } = req.body
    await repo.registrarGestion({
      creditoId: parseInt(req.params.id),
      usuarioId: req.usuario.id,
      tipo, descripcion, resultado
    })
    res.json({ mensaje: 'Gestion registrada' })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const historialGestiones = async (req, res) => {
  try {
    const data = await repo.getHistorialGestiones(parseInt(req.params.id))
    res.json({ gestiones: data })
  } catch(err) { res.status(500).json({ error: err.message }) }
}

const transicionar = async (req, res) => {
  try {
    const { estado } = req.body
    await repo.transicionarEstado(parseInt(req.params.id), estado, req.usuario.id)
    res.json({ mensaje: `Credito pasado a ${estado}` })
  } catch(err) { res.status(err.status||500).json({ error: err.message }) }
}

module.exports = {
  misCreditos, cuotas, solicitar, misSolicitudes,
  bandeja, detalle, evaluar, aprobar, rechazar, desembolsar,
  carteraMora, registrarGestion, historialGestiones, transicionar
}
