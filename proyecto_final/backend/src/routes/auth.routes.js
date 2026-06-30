const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/auth.controller')
const { verificarToken } = require('../middlewares/auth.middleware')

router.post('/login',    ctrl.login)
router.post('/registro', ctrl.registro)
router.post('/logout',   ctrl.logout)
router.get( '/perfil',   verificarToken, ctrl.perfil)

module.exports = router
