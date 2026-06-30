
const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/creditos.controller')
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

router.use(verificarToken)

// ── Homebanking (cliente) ──────────────────────────────────
router.get('/mis-creditos',          verificarRol('cliente'), ctrl.misCreditos)
router.get('/:id/cuotas',            verificarRol('cliente'), ctrl.cuotas)
router.post('/solicitar',            verificarRol('cliente'), ctrl.solicitar)
router.get('/mis-solicitudes',       verificarRol('cliente'), ctrl.misSolicitudes)

// ── Core: bandeja general ──────────────────────────────────
router.get('/bandeja',               verificarRol('asesor','admin','riesgos','comite','gerencia'), ctrl.bandeja)
router.get('/bandeja/:id',           verificarRol('asesor','admin','riesgos','comite','gerencia'), ctrl.detalle)

// ── Core: flujo de aprobacion ─────────────────────────────
router.put('/:id/evaluar',           verificarRol('riesgos'), ctrl.evaluar)
router.put('/:id/aprobar',           verificarRol('admin','comite','gerencia'), ctrl.aprobar)
router.put('/:id/rechazar',          verificarRol('admin','riesgos','comite','gerencia'), ctrl.rechazar)
router.post('/:id/desembolsar',      verificarRol('admin','gerencia'), ctrl.desembolsar)

// ── Core: mora y recuperaciones ───────────────────────────
router.get('/mora/cartera',          verificarRol('asesor','admin','riesgos','gerencia'), ctrl.carteraMora)
router.post('/mora/:id/gestion',     verificarRol('asesor','admin','riesgos'), ctrl.registrarGestion)
router.get('/mora/:id/historial',    verificarRol('asesor','admin','riesgos','gerencia'), ctrl.historialGestiones)
router.put('/mora/:id/transicion',   verificarRol('admin','riesgos','gerencia'), ctrl.transicionar)

module.exports = router
