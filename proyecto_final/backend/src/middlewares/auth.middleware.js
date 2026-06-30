const jwt = require('jsonwebtoken')

const MAX_INTENTOS = 5

const verificarToken = (req, res, next) => {
  const auth  = req.headers['authorization']
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' })
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expirado' })
    return res.status(403).json({ error: 'Token invalido' })
  }
}

const verificarRol = (...roles) => (req, res, next) => {
  if (!req.usuario) return res.status(401).json({ error: 'No autenticado' })
  if (!roles.flat().includes(req.usuario.rol))
    return res.status(403).json({ error: `Acceso denegado. Roles: ${roles.flat().join(', ')}` })
  next()
}

module.exports = { verificarToken, verificarRol, MAX_INTENTOS }
