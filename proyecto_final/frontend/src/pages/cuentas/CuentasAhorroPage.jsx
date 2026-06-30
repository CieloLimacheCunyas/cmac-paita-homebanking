import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiggyBank, ChevronRight, ChevronDown, ArrowDownCircle, ArrowUpCircle, Eye } from 'lucide-react'
import { useCuentas } from '../../hooks/useCuentas.js'
import { getMovimientos, depositar, retirar } from '../../services/cuentasService.js'
import { formatMoney, extractError } from '../../utils/format.js'
import Loader from '../../components/ui/Loader.jsx'
import Alert from '../../components/ui/Alert.jsx'

export default function CuentasAhorroPage() {
  const { cuentas, loading, error, recargar } = useCuentas()
  const [abierta,      setAbierta]      = useState(null)
  const [movimientos,  setMovimientos]  = useState([])
  const [loadingMov,   setLoadingMov]   = useState(false)
  const [modal,        setModal]        = useState(null) // { tipo:'deposito'|'retiro', cuentaId }
  const [monto,        setMonto]        = useState('')
  const [desc,         setDesc]         = useState('')
  const [opError,      setOpError]      = useState(null)
  const [opOk,         setOpOk]         = useState(null)
  const [loadingOp,    setLoadingOp]    = useState(false)

  const toggleCuenta = async (cuenta) => {
    if (abierta === cuenta.id) { setAbierta(null); return }
    setAbierta(cuenta.id)
    setLoadingMov(true)
    try {
      const data = await getMovimientos(cuenta.id)
      setMovimientos(data.movimientos)
    } catch { setMovimientos([]) }
    finally { setLoadingMov(false) }
  }

  const abrirModal = (tipo, cuentaId) => {
    setModal({ tipo, cuentaId })
    setMonto(''); setDesc(''); setOpError(null); setOpOk(null)
  }

  const cerrarModal = () => { setModal(null); setOpError(null); setOpOk(null) }

  const ejecutarOperacion = async () => {
    if (!monto || parseFloat(monto) <= 0) { setOpError('Ingresa un monto valido'); return }
    setLoadingOp(true); setOpError(null)
    try {
      if (modal.tipo === 'deposito') {
        await depositar(modal.cuentaId, parseFloat(monto), desc)
        setOpOk('Deposito realizado exitosamente')
      } else {
        await retirar(modal.cuentaId, parseFloat(monto), desc)
        setOpOk('Retiro realizado exitosamente')
      }
      recargar()
      // Recargar movimientos si la cuenta esta abierta
      if (abierta === modal.cuentaId) {
        const data = await getMovimientos(modal.cuentaId)
        setMovimientos(data.movimientos)
      }
    } catch (err) {
      setOpError(extractError(err, 'Error al procesar operacion'))
    } finally { setLoadingOp(false) }
  }

  const totalSaldo = cuentas.reduce((s, c) => s + parseFloat(c.saldo), 0)

  return (
    <div>
      <h2 className="cp-page-title">Cuentas de Ahorro</h2>
      <p className="cp-page-sub">Administra tus cuentas y realiza operaciones</p>

      {loading && <Loader text="Cargando cuentas..." />}
      {error   && <Alert tipo="error">{error}</Alert>}

      {!loading && cuentas.length === 0 && (
        <div className="cp-card"><div className="cp-card-body"><p className="cp-empty">No tienes cuentas de ahorro registradas.</p></div></div>
      )}

      {/* Resumen total */}
      {cuentas.length > 0 && (
        <div style={{ background:'var(--cp-azul)', color:'#fff', borderRadius:'var(--cp-radius)', padding:'1.25rem 1.5rem', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>SALDO TOTAL DISPONIBLE</div>
            <div style={{ fontSize:28, fontWeight:800 }}>{formatMoney(totalSaldo)}</div>
          </div>
          <PiggyBank size={40} style={{ opacity:.4 }} />
        </div>
      )}

      {/* Lista de cuentas */}
      {cuentas.map(cuenta => (
        <div key={cuenta.id} className="cp-card" style={{ marginBottom:14 }}>
          {/* Cabecera de cuenta */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', cursor:'pointer' }}
            onClick={() => toggleCuenta(cuenta)}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'var(--cp-azul-light)', color:'var(--cp-azul)', display:'grid', placeItems:'center' }}>
                <PiggyBank size={22} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{cuenta.numero_cuenta}</div>
                <div style={{ fontSize:12, color:'var(--cp-muted)' }}>{cuenta.tipo} ·
                  <span style={{ marginLeft:6, background: cuenta.estado==='activa' ? '#ECFDF5' : '#FEF2F2', color: cuenta.estado==='activa' ? '#065F46' : '#991B1B', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                    {cuenta.estado}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:20, fontWeight:800, color:'var(--cp-azul)' }}>{formatMoney(cuenta.saldo)}</div>
                <div style={{ fontSize:11, color:'var(--cp-muted)' }}>{cuenta.moneda}</div>
              </div>
              <ChevronDown size={20} style={{ color:'var(--cp-muted)', transform: abierta===cuenta.id ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
            </div>
          </div>

          {/* Detalle expandible */}
          {abierta === cuenta.id && (
            <div style={{ borderTop:'1px dashed var(--cp-border)', padding:'1rem 1.25rem' }}>
              {/* Botones de operación */}
              <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                <button className="cp-btn" style={{ flex:1, gap:8 }} onClick={() => abrirModal('deposito', cuenta.id)}>
                  <ArrowDownCircle size={18} /> Depositar
                </button>
                <button className="cp-btn-ghost" style={{ flex:1, gap:8 }} onClick={() => abrirModal('retiro', cuenta.id)}>
                  <ArrowUpCircle size={18} /> Retirar
                </button>
              </div>

              {/* Movimientos */}
              <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:'var(--cp-text)' }}>Ultimos movimientos</div>
              {loadingMov && <Loader text="Cargando movimientos..." />}
              {!loadingMov && movimientos.length === 0 && <p className="cp-empty">Sin movimientos registrados.</p>}
              {!loadingMov && movimientos.map(m => (
                <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--cp-border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:8, background: m.tipo==='deposito' ? '#ECFDF5' : '#FEF2F2', color: m.tipo==='deposito' ? '#065F46' : '#991B1B', display:'grid', placeItems:'center' }}>
                      {m.tipo==='deposito' ? <ArrowDownCircle size={18}/> : <ArrowUpCircle size={18}/>}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{m.descripcion}</div>
                      <div style={{ fontSize:11, color:'var(--cp-muted)' }}>{new Date(m.creado_en).toLocaleDateString('es-PE')} · {m.referencia}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, color: m.tipo==='deposito' ? '#065F46' : '#991B1B' }}>
                      {m.tipo==='deposito' ? '+' : '-'}{formatMoney(m.monto)}
                    </div>
                    <div style={{ fontSize:11, color:'var(--cp-muted)' }}>Saldo: {formatMoney(m.saldo_despues)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Modal deposito/retiro */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'2rem', width:'100%', maxWidth:400, margin:'0 1rem' }}>
            <h3 style={{ margin:'0 0 1rem', fontSize:'1.25rem', fontWeight:700, color:'var(--cp-text)', textTransform:'capitalize' }}>
              {modal.tipo === 'deposito' ? '💰 Realizar Deposito' : '💸 Realizar Retiro'}
            </h3>

            <Alert tipo="error">{opError}</Alert>
            <Alert tipo="ok">{opOk}</Alert>

            {!opOk && (
              <>
                <div className="hb-field">
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Monto (S/)</label>
                  <input className="hb-input" style={{ paddingLeft:'.875rem' }} type="number" min="1" step="0.01"
                    placeholder="0.00" value={monto} onChange={e => setMonto(e.target.value)} autoFocus />
                </div>
                <div className="hb-field">
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Descripcion (opcional)</label>
                  <input className="hb-input" style={{ paddingLeft:'.875rem' }} type="text"
                    placeholder="Ej. Deposito mensual" value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
                <div style={{ display:'flex', gap:10, marginTop:'1rem' }}>
                  <button className="cp-btn" style={{ flex:1 }} onClick={ejecutarOperacion} disabled={loadingOp}>
                    {loadingOp ? <><span className="cp-spinner"/> Procesando...</> : 'Confirmar'}
                  </button>
                  <button className="cp-btn-ghost" style={{ flex:1 }} onClick={cerrarModal}>Cancelar</button>
                </div>
              </>
            )}
            {opOk && (
              <button className="cp-btn" style={{ width:'100%', marginTop:'1rem' }} onClick={cerrarModal}>Cerrar</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
