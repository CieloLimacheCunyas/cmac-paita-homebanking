const authService = require('../services/auth.service')

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Usuario y contrasena son requeridos' })
    const data = await authService.login(username, password)
    res.json({ mensaje: 'Login exitoso', ...data })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error interno' })
  }
}

const registro = async (req, res) => {
  try {
    const { dni, nombres, apellidos, email, password, telefono } = req.body
    if (!dni || !nombres || !apellidos || !email || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: 'DNI debe tener 8 digitos' })
    if (password.length < 8)  return res.status(400).json({ error: 'Contrasena minimo 8 caracteres' })
    const data = await authService.registro({ dni, nombres, apellidos, email, password, telefono })
    res.status(201).json({ mensaje: 'Registro exitoso', ...data })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error interno' })
  }
}

const logout = async (req, res) => {
  try {
    await authService.logout(req.body?.refreshToken)
    res.json({ mensaje: 'Sesion cerrada' })
  } catch { res.json({ mensaje: 'Sesion cerrada' }) }
}

const perfil = (req, res) => res.json({ usuario: req.usuario })

module.exports = { login, registro, logout, perfil }
