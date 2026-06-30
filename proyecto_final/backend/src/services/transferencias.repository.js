
const pool = require('../config/db')

async function transferir({ cuentaOrigenId, personaId, numeroCuentaDestino, monto, descripcion }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Verificar cuenta origen
    const { rows: [origen] } = await client.query(
      'SELECT id, saldo FROM cuentas WHERE id=$1 AND persona_id=$2 AND estado=$3 FOR UPDATE',
      [cuentaOrigenId, personaId, 'activa']
    )
    if (!origen) throw { status: 404, message: 'Cuenta origen no encontrada' }
    if (parseFloat(origen.saldo) < parseFloat(monto))
      throw { status: 400, message: 'Saldo insuficiente' }

    // Verificar cuenta destino
    const { rows: [destino] } = await client.query(
      "SELECT id, saldo FROM cuentas WHERE numero_cuenta=$1 AND estado='activa'",
      [numeroCuentaDestino]
    )
    if (!destino) throw { status: 404, message: 'Cuenta destino no encontrada' }
    if (origen.id === destino.id) throw { status: 400, message: 'No puedes transferir a la misma cuenta' }

    const ref = 'TRF-' + Date.now()
    const nuevoSaldoOrigen  = parseFloat(origen.saldo)  - parseFloat(monto)
    const nuevoSaldoDestino = parseFloat(destino.saldo) + parseFloat(monto)

    await client.query('UPDATE cuentas SET saldo=$1, actualizado_en=NOW() WHERE id=$2', [nuevoSaldoOrigen,  origen.id])
    await client.query('UPDATE cuentas SET saldo=$1, actualizado_en=NOW() WHERE id=$2', [nuevoSaldoDestino, destino.id])

    await client.query(
      `INSERT INTO movimientos (cuenta_id,tipo,monto,saldo_despues,descripcion,referencia,cuenta_destino)
       VALUES ($1,'transferencia_out',$2,$3,$4,$5,$6)`,
      [origen.id, monto, nuevoSaldoOrigen, descripcion||'Transferencia enviada', ref, destino.id]
    )
    await client.query(
      `INSERT INTO movimientos (cuenta_id,tipo,monto,saldo_despues,descripcion,referencia,cuenta_destino)
       VALUES ($1,'transferencia_in',$2,$3,$4,$5,$6)`,
      [destino.id, monto, nuevoSaldoDestino, descripcion||'Transferencia recibida', ref, origen.id]
    )

    await client.query('COMMIT')
    return { referencia: ref, saldo_nuevo: nuevoSaldoOrigen }
  } catch(err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function pagarCuota({ cuentaId, personaId, cuotaId }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [cuota] } = await client.query(
      `SELECT q.*, c.persona_id, ct.id AS cuenta_cargo
       FROM cuotas_credito q
       JOIN creditos c ON c.id = q.credito_id
       JOIN cuentas ct ON ct.persona_id = c.persona_id
       WHERE q.id=$1 AND c.persona_id=$2 AND q.estado='pendiente'`,
      [cuotaId, personaId]
    )
    if (!cuota) throw { status: 404, message: 'Cuota no encontrada o ya pagada' }

    const { rows: [cuenta] } = await client.query(
      'SELECT id, saldo FROM cuentas WHERE id=$1 AND persona_id=$2 FOR UPDATE',
      [cuentaId, personaId]
    )
    if (!cuenta) throw { status: 404, message: 'Cuenta no encontrada' }
    if (parseFloat(cuenta.saldo) < parseFloat(cuota.cuota))
      throw { status: 400, message: 'Saldo insuficiente para pagar la cuota' }

    const nuevoSaldo = parseFloat(cuenta.saldo) - parseFloat(cuota.cuota)
    const ref = 'PAG-' + Date.now()

    await client.query('UPDATE cuentas SET saldo=$1, actualizado_en=NOW() WHERE id=$2', [nuevoSaldo, cuentaId])
    await client.query(
      `UPDATE cuotas_credito SET estado='pagada', fecha_pago=CURRENT_DATE, monto_pagado=$1 WHERE id=$2`,
      [cuota.cuota, cuotaId]
    )
    await client.query(
      `UPDATE creditos SET saldo_pendiente=saldo_pendiente-$1 WHERE id=$2`,
      [cuota.capital, cuota.credito_id]
    )
    await client.query(
      `INSERT INTO movimientos (cuenta_id,tipo,monto,saldo_despues,descripcion,referencia)
       VALUES ($1,'cuota_credito',$2,$3,$4,$5)`,
      [cuentaId, cuota.cuota, nuevoSaldo, 'Pago cuota credito', ref]
    )

    await client.query('COMMIT')
    return { referencia: ref, saldo_nuevo: nuevoSaldo }
  } catch(err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { transferir, pagarCuota }
