
const pool = require('../config/db')

// ── Homebanking: mis creditos ──────────────────────────────
async function getCreditosByPersona(personaId) {
  const { rows } = await pool.query(
    `SELECT id, numero_credito, monto_desembolso, saldo_pendiente,
            cuota_mensual, tea, plazo_meses, fecha_desembolso,
            fecha_vencimiento, estado, dias_atraso
     FROM creditos WHERE persona_id=$1 ORDER BY fecha_desembolso DESC`,
    [personaId]
  )
  return rows
}

async function getCuotasByCredito(creditoId, personaId) {
  const { rows: [cred] } = await pool.query(
    'SELECT id FROM creditos WHERE id=$1 AND persona_id=$2', [creditoId, personaId]
  )
  if (!cred) return null
  const { rows } = await pool.query(
    `SELECT nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado, fecha_pago
     FROM cuotas_credito WHERE credito_id=$1 ORDER BY nro_cuota`,
    [creditoId]
  )
  return rows
}

// ── Solicitudes desde Homebanking ─────────────────────────
async function crearSolicitud({ personaId, monto, plazoMeses, conSeguro, proposito }) {
  const { rows: [prod] } = await pool.query(
    'SELECT * FROM productos_credito WHERE activo=true LIMIT 1'
  )
  const tea = conSeguro ? prod.tea_con_seg : prod.tea_sin_seg
  // Calcular cuota fija (sistema frances)
  const tm  = Math.pow(1 + parseFloat(tea), 1/12) - 1
  const cuota = (monto * tm) / (1 - Math.pow(1+tm, -plazoMeses))
  const cuotaFija = Math.round(cuota * 100) / 100

  const { rows: [sol] } = await pool.query(
    `INSERT INTO solicitudes_credito
     (persona_id, producto_id, monto, plazo_meses, tea, con_seguro, cuota_mensual, proposito, estado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'enviado') RETURNING *`,
    [personaId, prod.id, monto, plazoMeses, tea, conSeguro, cuotaFija, proposito]
  )
  return sol
}

async function getMisSolicitudes(personaId) {
  const { rows } = await pool.query(
    `SELECT id, monto, plazo_meses, cuota_mensual, con_seguro,
            proposito, estado, scoring, obs_admin, fecha_solicitud
     FROM solicitudes_credito WHERE persona_id=$1 ORDER BY fecha_solicitud DESC`,
    [personaId]
  )
  return rows
}

// ── Core: bandeja de solicitudes ──────────────────────────
async function getBandeja(estado) {
  const where = estado ? 'WHERE s.estado=$1' : ''
  const params = estado ? [estado] : []
  const { rows } = await pool.query(
    `SELECT s.id, s.monto, s.plazo_meses, s.cuota_mensual, s.con_seguro,
            s.proposito, s.estado, s.scoring, s.rds, s.fecha_solicitud,
            p.nombres, p.apellidos, p.dni,
            pc.nombre AS producto
     FROM solicitudes_credito s
     JOIN personas p ON p.id = s.persona_id
     JOIN productos_credito pc ON pc.id = s.producto_id
     ${where}
     ORDER BY s.fecha_solicitud DESC`,
    params
  )
  return rows
}

async function getSolicitudById(id) {
  const { rows: [s] } = await pool.query(
    `SELECT s.*, p.nombres, p.apellidos, p.dni, p.telefono,
            pc.nombre AS producto
     FROM solicitudes_credito s
     JOIN personas p ON p.id = s.persona_id
     JOIN productos_credito pc ON pc.id = s.producto_id
     WHERE s.id=$1`,
    [id]
  )
  return s || null
}

async function actualizarEstado(id, estado, campos) {
  const sets = Object.keys(campos).map((k,i) => `${k}=$${i+2}`).join(',')
  const vals = Object.values(campos)
  await pool.query(
    `UPDATE solicitudes_credito SET estado=$1,${sets},actualizado_en=NOW() WHERE id=${id+Object.keys(campos).length+1}`,
    [estado, ...vals, id]
  )
}

async function evaluarSolicitud(id, { scoring, rds, obs, usuarioId }) {
  await pool.query(
    `UPDATE solicitudes_credito
     SET estado='en_evaluacion', scoring=$1, rds=$2, obs_riesgos=$3,
         riesgos_id=$4, actualizado_en=NOW()
     WHERE id=$5`,
    [scoring, rds, obs, usuarioId, id]
  )
}

async function aprobarAdmin(id, { obs, usuarioId }) {
  await pool.query(
    `UPDATE solicitudes_credito
     SET estado='aprobado', obs_admin=$1, admin_id=$2, actualizado_en=NOW()
     WHERE id=$3`,
    [obs, usuarioId, id]
  )
}

async function rechazarSolicitud(id, { obs, usuarioId }) {
  await pool.query(
    `UPDATE solicitudes_credito
     SET estado='rechazado', obs_admin=$1, admin_id=$2, actualizado_en=NOW()
     WHERE id=$3`,
    [obs, usuarioId, id]
  )
}

async function desembolsar(id, usuarioId) {
  const sol = await getSolicitudById(id)
  if (!sol || sol.estado !== 'aprobado')
    throw { status: 400, message: 'Solicitud no esta aprobada' }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Crear credito
    const nroCred = 'CRED-' + String(id).padStart(4,'0') + '-' + new Date().getFullYear()
    const fechaDesembolso = new Date()
    const fechaVencimiento = new Date()
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + sol.plazo_meses)

    const { rows: [cred] } = await client.query(
      `INSERT INTO creditos
       (solicitud_id, persona_id, cuenta_id, numero_credito, monto_desembolso,
        saldo_pendiente, cuota_mensual, tea, plazo_meses, fecha_desembolso, fecha_vencimiento)
       SELECT $1,$2,c.id,$3,$4,$4,$5,$6,$7,$8,$9
       FROM cuentas c WHERE c.persona_id=$2 LIMIT 1
       RETURNING *`,
      [id, sol.persona_id, nroCred, sol.monto, sol.cuota_mensual,
       sol.tea, sol.plazo_meses, fechaDesembolso, fechaVencimiento]
    )

    // Generar cronograma
    const tm = Math.pow(1 + parseFloat(sol.tea), 1/12) - 1
    let saldo = parseFloat(sol.monto)
    for (let i=1; i<=sol.plazo_meses; i++) {
      const interes  = Math.round(saldo * tm * 100) / 100
      const capital  = Math.round((parseFloat(sol.cuota_mensual) - interes) * 100) / 100
      saldo = Math.round((saldo - capital) * 100) / 100
      if (i === sol.plazo_meses) saldo = 0
      const fVenc = new Date(fechaDesembolso)
      fVenc.setMonth(fVenc.getMonth() + i)
      await client.query(
        `INSERT INTO cuotas_credito (credito_id,nro_cuota,fecha_venc,cuota,capital,interes,saldo)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [cred.id, i, fVenc, sol.cuota_mensual, capital, interes, Math.max(0,saldo)]
      )
    }

    // Acreditar monto en cuenta de ahorro
    await client.query(
      `UPDATE cuentas SET saldo=saldo+$1, actualizado_en=NOW()
       WHERE persona_id=$2`,
      [sol.monto, sol.persona_id]
    )

    // Registrar movimiento
    const { rows: [cuenta] } = await client.query(
      'SELECT id, saldo FROM cuentas WHERE persona_id=$1', [sol.persona_id]
    )
    await client.query(
      `INSERT INTO movimientos (cuenta_id,tipo,monto,saldo_despues,descripcion,referencia)
       VALUES ($1,'desembolso',$2,$3,$4,$5)`,
      [cuenta.id, sol.monto, cuenta.saldo, 'Desembolso credito ' + nroCred, nroCred]
    )

    // Actualizar solicitud
    await client.query(
      `UPDATE solicitudes_credito SET estado='desembolsado',fecha_desembolso=NOW(),
       actualizado_en=NOW() WHERE id=$1`,
      [id]
    )

    await client.query('COMMIT')
    return cred
  } catch(err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ── Mora / Recuperaciones ──────────────────────────────────
async function getCarteraMora() {
  const { rows } = await pool.query(
    `SELECT c.id, c.numero_credito, c.saldo_pendiente, c.cuota_mensual,
            c.dias_atraso, c.estado,
            p.nombres, p.apellidos, p.dni, p.telefono,
            CASE
              WHEN c.dias_atraso = 0 THEN 'preventiva'
              WHEN c.dias_atraso BETWEEN 1 AND 30 THEN 'temprana'
              WHEN c.dias_atraso BETWEEN 31 AND 90 THEN 'tardia'
              WHEN c.dias_atraso BETWEEN 91 AND 180 THEN 'judicial'
              ELSE 'castigo'
            END AS banda
     FROM creditos c
     JOIN personas p ON p.id = c.persona_id
     WHERE c.estado IN ('vigente','judicial','castigado')
     ORDER BY c.dias_atraso DESC`
  )
  return rows
}

async function registrarGestion({ creditoId, usuarioId, tipo, descripcion, resultado }) {
  await pool.query(
    `INSERT INTO gestiones_cobranza (credito_id,usuario_id,tipo,descripcion,resultado)
     VALUES ($1,$2,$3,$4,$5)`,
    [creditoId, usuarioId, tipo, descripcion, resultado]
  )
}

async function getHistorialGestiones(creditoId) {
  const { rows } = await pool.query(
    `SELECT g.*, u.email, p.nombres, p.apellidos
     FROM gestiones_cobranza g
     JOIN usuarios u ON u.id = g.usuario_id
     JOIN personas p ON p.id = u.persona_id
     WHERE g.credito_id=$1 ORDER BY g.creado_en DESC`,
    [creditoId]
  )
  return rows
}

async function transicionarEstado(creditoId, nuevoEstado, usuarioId) {
  const { rows: [cred] } = await pool.query(
    'SELECT dias_atraso, estado FROM creditos WHERE id=$1', [creditoId]
  )
  if (!cred) throw { status: 404, message: 'Credito no encontrado' }
  if (nuevoEstado === 'judicial'  && cred.dias_atraso < 121)
    throw { status: 400, message: 'Requiere minimo 121 dias de atraso para pasar a judicial' }
  if (nuevoEstado === 'castigado' && cred.dias_atraso <= 180)
    throw { status: 400, message: 'Requiere mas de 180 dias de atraso para castigar' }

  await pool.query(
    'UPDATE creditos SET estado=$1 WHERE id=$2', [nuevoEstado, creditoId]
  )
  await registrarGestion({
    creditoId, usuarioId,
    tipo: 'transicion',
    descripcion: `Cambio de estado a ${nuevoEstado}`,
    resultado: 'completado'
  })
}

module.exports = {
  getCreditosByPersona, getCuotasByCredito, crearSolicitud, getMisSolicitudes,
  getBandeja, getSolicitudById, evaluarSolicitud, aprobarAdmin, rechazarSolicitud, desembolsar,
  getCarteraMora, registrarGestion, getHistorialGestiones, transicionarEstado
}
