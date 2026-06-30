const pool = require('../config/db')

async function getCuentasByPersona(personaId) {
  const { rows } = await pool.query(
    `SELECT id, numero_cuenta, tipo, saldo, moneda, estado, fecha_apertura
     FROM cuentas
     WHERE persona_id = $1
     ORDER BY fecha_apertura DESC`,
    [personaId]
  )
  return rows
}

async function getCuentaById(cuentaId, personaId) {
  const { rows } = await pool.query(
    `SELECT id, numero_cuenta, tipo, saldo, moneda, estado, fecha_apertura
     FROM cuentas
     WHERE id = $1 AND persona_id = $2`,
    [cuentaId, personaId]
  )
  return rows[0] || null
}

async function getMovimientos(cuentaId, personaId, limit = 20) {
  // Verificar que la cuenta pertenece al cliente
  const cuenta = await getCuentaById(cuentaId, personaId)
  if (!cuenta) return null

  const { rows } = await pool.query(
    `SELECT id, tipo, monto, saldo_despues, descripcion, referencia, creado_en
     FROM movimientos
     WHERE cuenta_id = $1
     ORDER BY creado_en DESC
     LIMIT $2`,
    [cuentaId, limit]
  )
  return { cuenta, movimientos: rows }
}

async function depositar(cuentaId, personaId, monto, descripcion) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Verificar cuenta
    const { rows: [cuenta] } = await client.query(
      'SELECT id, saldo FROM cuentas WHERE id=$1 AND persona_id=$2 AND estado=$3 FOR UPDATE',
      [cuentaId, personaId, 'activa']
    )
    if (!cuenta) throw { status: 404, message: 'Cuenta no encontrada o inactiva' }

    const nuevoSaldo = parseFloat(cuenta.saldo) + parseFloat(monto)

    // Actualizar saldo
    await client.query(
      'UPDATE cuentas SET saldo=$1, actualizado_en=NOW() WHERE id=$2',
      [nuevoSaldo, cuentaId]
    )

    // Registrar movimiento
    const ref = 'DEP-' + Date.now()
    const { rows: [mov] } = await client.query(
      `INSERT INTO movimientos (cuenta_id, tipo, monto, saldo_despues, descripcion, referencia)
       VALUES ($1,'deposito',$2,$3,$4,$5) RETURNING *`,
      [cuentaId, monto, nuevoSaldo, descripcion || 'Deposito en linea', ref]
    )

    await client.query('COMMIT')
    return { movimiento: mov, saldo_nuevo: nuevoSaldo }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function retirar(cuentaId, personaId, monto, descripcion) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [cuenta] } = await client.query(
      'SELECT id, saldo FROM cuentas WHERE id=$1 AND persona_id=$2 AND estado=$3 FOR UPDATE',
      [cuentaId, personaId, 'activa']
    )
    if (!cuenta) throw { status: 404, message: 'Cuenta no encontrada o inactiva' }
    if (parseFloat(cuenta.saldo) < parseFloat(monto))
      throw { status: 400, message: 'Saldo insuficiente' }

    const nuevoSaldo = parseFloat(cuenta.saldo) - parseFloat(monto)

    await client.query(
      'UPDATE cuentas SET saldo=$1, actualizado_en=NOW() WHERE id=$2',
      [nuevoSaldo, cuentaId]
    )

    const ref = 'RET-' + Date.now()
    const { rows: [mov] } = await client.query(
      `INSERT INTO movimientos (cuenta_id, tipo, monto, saldo_despues, descripcion, referencia)
       VALUES ($1,'retiro',$2,$3,$4,$5) RETURNING *`,
      [cuentaId, monto, nuevoSaldo, descripcion || 'Retiro en linea', ref]
    )

    await client.query('COMMIT')
    return { movimiento: mov, saldo_nuevo: nuevoSaldo }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { getCuentasByPersona, getCuentaById, getMovimientos, depositar, retirar }
