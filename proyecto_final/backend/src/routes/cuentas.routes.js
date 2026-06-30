const express  = require('express')
const router   = express.Router()
const ctrl     = require('../controllers/cuentas.controller')
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

// Todas requieren token
router.use(verificarToken)

// GET  /api/cuentas               → listar cuentas del cliente
router.get('/', verificarRol('cliente'), ctrl.listar)

// GET  /api/cuentas/:id/movimientos
router.get('/:id/movimientos', verificarRol('cliente'), ctrl.movimientos)

// POST /api/cuentas/:id/depositar
router.post('/:id/depositar', verificarRol('cliente'), ctrl.depositar)

// POST /api/cuentas/:id/retirar
router.post('/:id/retirar', verificarRol('cliente'), ctrl.retirar)

module.exports = router
