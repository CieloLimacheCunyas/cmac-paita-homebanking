const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const repo   = require('./auth.repository')

const SALT = 10

function generarTokens(payload) {
  return {
    accessToken:  jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' }),
  }
}

async function login(username, password) {
  const u = await repo.buscarPorUsername(username)
  if (!u) throw { status: 401, message: 'Credenciales invalidas' }
  if (!u.activo)   throw { status: 403, message: 'Usuario inactivo. Contacte a CMAC Paita.' }
  if (u.bloqueado) throw { status: 403, message: 'Usuario bloqueado por intentos fallidos. Contacte a CMAC Paita.' }

  const valido = await bcrypt.compare(password, u.password_hash)
  if (!valido) {
    const intentos  = await repo.registrarLoginFallido(u.id)
    const restantes = Math.max(0, repo.MAX_INTENTOS - intentos)
    if (restantes === 0)
      throw { status: 401, message: 'Credenciales invalidas. Usuario bloqueado por exceder intentos.' }
    throw { status: 401, message: `Credenciales invalidas. Intentos restantes: ${restantes}` }
  }

  await repo.registrarLoginExitoso(u.id)

  const payload = { id: u.id, username: u.username, email: u.email, rol: u.rol, personaId: u.persona_id, nombres: u.nombres, apellidos: u.apellidos }
  const tokens  = generarTokens(payload)
  await repo.guardarRefreshToken(u.id, tokens.refreshToken)

  return { ...tokens, usuario: payload }
}

async function registro({ dni, nombres, apellidos, email, password, telefono }) {
  if (await repo.existeEmail(email.toLowerCase())) throw { status: 400, message: 'El email ya esta registrado' }
  if (await repo.existeDni(dni))                   throw { status: 400, message: 'El DNI ya esta registrado' }

  const hash     = await bcrypt.hash(password, SALT)
  const rolId    = await repo.getRolId('cliente')
  const personaId = await repo.crearPersona(dni, nombres, apellidos, telefono)
  const username  = 'cli' + dni
  const usuarioId = await repo.crearUsuario(personaId, rolId, username, email.toLowerCase(), hash)
  await repo.crearCuenta(personaId, '10' + dni.padStart(14, '0'))

  const payload = { id: usuarioId, username, email: email.toLowerCase(), rol: 'cliente', personaId, nombres, apellidos }
  const tokens  = generarTokens(payload)
  await repo.guardarRefreshToken(usuarioId, tokens.refreshToken)

  return { ...tokens, usuario: payload }
}

async function logout(refreshToken) {
  if (refreshToken) await repo.revocarRefreshToken(refreshToken)
}

module.exports = { login, registro, logout }
