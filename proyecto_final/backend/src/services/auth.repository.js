// Consultas SQL de autenticacion (patron del profesor: SQL crudo, sin ORM)
const pool = require('../config/db')

const MAX_INTENTOS = 5

async function buscarPorUsername(username) {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.email, u.password_hash, u.activo, u.bloqueado, u.intentos_fallidos,
            r.nombre AS rol,
            p.id AS persona_id, p.nombres, p.apellidos, p.dni
     FROM usuarios u
     JOIN roles    r ON r.id = u.rol_id
     JOIN personas p ON p.id = u.persona_id
     WHERE LOWER(u.username) = LOWER($1)`,
    [username.trim()]
  )
  return rows[0] || null
}

async function registrarLoginExitoso(usuarioId) {
  await pool.query(
    'UPDATE usuarios SET ultimo_acceso=NOW(), intentos_fallidos=0, actualizado_en=NOW() WHERE id=$1',
    [usuarioId]
  )
}

async function registrarLoginFallido(usuarioId) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET intentos_fallidos = intentos_fallidos + 1,
         bloqueado = CASE WHEN intentos_fallidos + 1 >= $2 THEN TRUE ELSE bloqueado END,
         actualizado_en = NOW()
     WHERE id = $1
     RETURNING intentos_fallidos`,
    [usuarioId, MAX_INTENTOS]
  )
  return rows[0].intentos_fallidos
}

async function crearPersona(dni, nombres, apellidos, telefono) {
  const { rows } = await pool.query(
    'INSERT INTO personas (dni,nombres,apellidos,telefono) VALUES ($1,$2,$3,$4) RETURNING id',
    [dni, nombres, apellidos, telefono || null]
  )
  return rows[0].id
}

async function crearUsuario(personaId, rolId, username, email, hash) {
  const { rows } = await pool.query(
    'INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [personaId, rolId, username, email, hash]
  )
  return rows[0].id
}

async function crearCuenta(personaId, numeroCuenta) {
  await pool.query(
    'INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES ($1,$2,0.00)',
    [numeroCuenta, personaId]
  )
}

async function existeEmail(email) {
  const { rows } = await pool.query('SELECT id FROM usuarios WHERE email=$1', [email.toLowerCase()])
  return rows.length > 0
}

async function existeDni(dni) {
  const { rows } = await pool.query('SELECT id FROM personas WHERE dni=$1', [dni])
  return rows.length > 0
}

async function getRolId(nombre) {
  const { rows } = await pool.query('SELECT id FROM roles WHERE nombre=$1', [nombre])
  return rows[0]?.id
}

async function guardarRefreshToken(usuarioId, token) {
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await pool.query(
    'INSERT INTO refresh_tokens (usuario_id,token,expira_en) VALUES ($1,$2,$3)',
    [usuarioId, token, expira]
  )
}

async function revocarRefreshToken(token) {
  await pool.query('UPDATE refresh_tokens SET revocado=TRUE WHERE token=$1', [token])
}

module.exports = {
  buscarPorUsername, registrarLoginExitoso, registrarLoginFallido,
  crearPersona, crearUsuario, crearCuenta, existeEmail, existeDni,
  getRolId, guardarRefreshToken, revocarRefreshToken, MAX_INTENTOS
}
