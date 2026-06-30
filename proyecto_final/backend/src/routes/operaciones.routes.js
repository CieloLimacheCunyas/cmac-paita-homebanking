
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/operaciones.controller')
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

router.use(verificarToken)
router.post('/transferir',   verificarRol('cliente'), ctrl.transferir)
router.post('/pagar-cuota',  verificarRol('cliente'), ctrl.pagarCuota)

module.exports = router
