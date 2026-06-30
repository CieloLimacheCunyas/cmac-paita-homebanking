require('dotenv').config()
const express            = require('express')
const cors               = require('cors')
const helmet             = require('helmet')
const authRoutes         = require('./src/routes/auth.routes')
const cuentasRoutes      = require('./src/routes/cuentas.routes')
const creditosRoutes     = require('./src/routes/creditos.routes')
const operacionesRoutes  = require('./src/routes/operaciones.routes')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',        authRoutes)
app.use('/api/cuentas',     cuentasRoutes)
app.use('/api/creditos',    creditosRoutes)
app.use('/api/operaciones', operacionesRoutes)

app.get('/api/health', (_req, res) =>
  res.json({ estado: 'OK', servicio: 'CMAC Paita API', version: '1.0.0' })
)

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`\n🚀 CMAC Paita API → http://localhost:${PORT}`)
  console.log(`📋 Rutas: /api/auth | /api/cuentas | /api/creditos | /api/operaciones\n`)
})

module.exports = app
