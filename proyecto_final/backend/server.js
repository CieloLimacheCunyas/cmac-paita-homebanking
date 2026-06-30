require('dotenv').config()
const express           = require('express')
const cors              = require('cors')
const helmet            = require('helmet')
const rateLimit         = require('express-rate-limit')
const authRoutes        = require('./src/routes/auth.routes')
const cuentasRoutes     = require('./src/routes/cuentas.routes')
const creditosRoutes    = require('./src/routes/creditos.routes')
const operacionesRoutes = require('./src/routes/operaciones.routes')

const app  = express()
const PORT = process.env.PORT || 3001

// ── 1. HELMET — Cabeceras de seguridad (XSS, Clickjacking, etc.) ──────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:"],
    }
  },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' }
}))

// ── 2. CORS restrictivo ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}))

app.use(express.json({ limit: '10kb' })) // Limita tamaño del body

// ── 3. RATE LIMITING — Fuerza bruta ──────────────────────────────────────
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Solo 10 intentos de login por IP cada 15 minutos
  message: { error: 'Demasiados intentos de login. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiterGeneral)
app.use('/api/auth/login', limiterLogin)

// ── 4. SANITIZACION — Prevenir SQL Injection y XSS ───────────────────────
const sanitizar = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Eliminar caracteres peligrosos SQL y XSS
      return obj
        .replace(/'/g, "''")           // SQL injection
        .replace(/--/g, '')             // SQL comentarios
        .replace(/;/g, '')              // SQL punto y coma
        .replace(/<script/gi, '')       // XSS script tag
        .replace(/javascript:/gi, '')   // XSS javascript:
        .replace(/on\w+=/gi, '')        // XSS event handlers
        .trim()
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => { obj[key] = sanitize(obj[key]) })
    }
    return obj
  }
  if (req.body)   req.body   = sanitize(req.body)
  if (req.params) req.params = sanitize(req.params)
  if (req.query)  req.query  = sanitize(req.query)
  next()
}

app.use(sanitizar)

// ── 5. IDOR — Verificacion de propiedad en middleware JWT ─────────────────
// (ya implementado en auth.middleware.js con verificarToken + verificarRol)

// ── Rutas ─────────────────────────────────────────────────────────────────
app.get('/', (_req, res) =>
  res.json({ message: 'CMAC Paita API funcionando correctamente' })
)

app.use('/api/auth',        authRoutes)
app.use('/api/cuentas',     cuentasRoutes)
app.use('/api/creditos',    creditosRoutes)
app.use('/api/operaciones', operacionesRoutes)

app.get('/api/health', (_req, res) =>
  res.json({ estado: 'OK', servicio: 'CMAC Paita API', version: '1.0.0',
             seguridad: ['helmet','rate-limit','sanitizacion','jwt','rbac'] })
)

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`\n🚀 CMAC Paita API → http://localhost:${PORT}`)
  console.log(`🔐 Seguridad: Helmet + Rate Limit + Sanitizacion + JWT + RBAC\n`)
})

module.exports = app