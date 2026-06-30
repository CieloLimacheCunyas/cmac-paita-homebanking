
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBandeja, evaluar, aprobar, rechazar, desembolsar } from '../../services/creditosService.js'
import { formatMoney, extractError } from '../../utils/format.js'
import { useHBAuth } from '../../hooks/useHBAuth.js'
import Loader from '../../components/ui/Loader.jsx'
import Alert from '../../components/ui/Alert.jsx'

const ESTADOS = {
  enviado:       ['#EFF6FF','#1D4ED8'],
  en_evaluacion: ['#FEF9C3','#854D0E'],
  aprobado:      ['#ECFDF5','#065F46'],
  rechazado:     ['#FEF2F2','#991B1B'],
  desembolsado:  ['#F0FDF4','#166534'],
}

export default function BandejaPage() {
  const { user }  = useHBAuth()
  const navigate  = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filtro,  setFiltro]          = useState('')
  const [modal,   setModal]           = useState(null)
  const [obs,     setObs]             = useState('')
  const [scoring, setScoring]         = useState('')
  const [rds,     setRds]             = useState('')
  const [error,   setError]           = useState(null)
  const [ok,      setOk]              = useState(null)
  const [loadingAc, setLoadingAc]     = useState(false)

  const cargar = async () => {
    setLoading(true)
    try { setSolicitudes(await getBandeja(filtro||undefined)) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [filtro])

  const accion = async (tipo, id) => {
    setLoadingAc(true); setError(null)
    try {
      if (tipo==='evaluar')    await evaluar(id, { scoring:parseInt(scoring), rds:parseFloat(rds), obs })
      if (tipo==='aprobar')    await aprobar(id, { obs })
      if (tipo==='rechazar')   await rechazar(id, { obs })
      if (tipo==='desembolsar') await desembolsar(id)
      setOk('Accion realizada exitosamente')
      setModal(null); cargar()
    } catch(err) { setError(extractError(err)) }
    finally { setLoadingAc(false) }
  }

  const FILTROS = ['','enviado','en_evaluacion','aprobado','rechazado','desembolsado']

  return (
    <div>
      <h2 className="cp-page-title">Bandeja de Creditos</h2>
      <p className="cp-page-sub">Gestion de solicitudes — rol: {user?.rol}</p>

      <Alert tipo="ok">{ok}</Alert>
      <Alert tipo="error">{error}</Alert>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding:'6px 16px', borderRadius:20, border:'1.5px solid',
            borderColor: filtro===f?'var(--cp-azul)':'var(--cp-border)',
            background: filtro===f?'var(--cp-azul-light)':'#fff',
            color: filtro===f?'var(--cp-azul)':'var(--cp-text)',
            fontWeight:600, fontSize:13, cursor:'pointer'
          }}>{f||'Todos'}</button>
        ))}
      </div>

      {loading && <Loader text="Cargando bandeja..." />}

      {!loading && solicitudes.length === 0 && (
        <div className="cp-card"><div className="cp-card-body"><p className="cp-empty">Sin solicitudes en esta bandeja.</p></div></div>
      )}

      {solicitudes.map(s => {
        const [bg,color] = ESTADOS[s.estado] || ['#F3F4F6','#374151']
        return (
          <div key={s.id} className="cp-card" style={{ marginBottom:12 }}>
            <div className="cp-card-body">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{s.nombres} {s.apellidos}</div>
                  <div style={{ color:'var(--cp-muted)', fontSize:13 }}>DNI: {s.dni} · {s.producto}</div>
                  <div style={{ marginTop:6, fontWeight:700, fontSize:18, color:'var(--cp-azul)' }}>{formatMoney(s.monto)}</div>
                  <div style={{ color:'var(--cp-muted)', fontSize:13 }}>{s.plazo_meses} meses · Cuota {formatMoney(s.cuota_mensual)}</div>
                  {s.proposito && <div style={{ color:'var(--cp-muted)', fontSize:12, marginTop:4 }}>{s.proposito}</div>}
                  {s.scoring && <div style={{ fontSize:12, marginTop:4 }}>Scoring: <strong>{s.scoring}</strong> · RDS: <strong>{(s.rds*100).toFixed(1)}%</strong></div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                  <span style={{ background:bg, color, padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>{s.estado}</span>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {user?.rol==='riesgos' && s.estado==='enviado' && (
                      <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px' }} onClick={() => { setModal({tipo:'evaluar',id:s.id}); setObs(''); setError(null) }}>Evaluar</button>
                    )}
                    {['admin','gerencia'].includes(user?.rol) && s.estado==='en_evaluacion' && (
                      <>
                        <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px' }} onClick={() => { setModal({tipo:'aprobar',id:s.id}); setObs(''); setError(null) }}>Aprobar</button>
                        <button className="cp-btn-ghost" style={{ fontSize:12, padding:'6px 12px' }} onClick={() => { setModal({tipo:'rechazar',id:s.id}); setObs(''); setError(null) }}>Rechazar</button>
                      </>
                    )}
                    {['admin','gerencia'].includes(user?.rol) && s.estado==='aprobado' && (
                      <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px', background:'var(--cp-naranja)' }} onClick={() => accion('desembolsar',s.id)}>Desembolsar</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'2rem', width:'100%', maxWidth:420, margin:'0 1rem' }}>
            <h3 style={{ margin:'0 0 1rem', fontWeight:700, fontSize:'1.1rem', textTransform:'capitalize' }}>
              {modal.tipo} solicitud
            </h3>
            <Alert tipo="error">{error}</Alert>
            {modal.tipo==='evaluar' && (
              <>
                <div className="hb-field">
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Scoring (0-1000)</label>
                  <input className="hb-input" style={{ paddingLeft:'.875rem' }} type="number" min="0" max="1000"
                    placeholder="Ej. 720" value={scoring} onChange={e=>setScoring(e.target.value)} />
                </div>
                <div className="hb-field">
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>RDS — Razon Deuda/Sueldo (0-1)</label>
                  <input className="hb-input" style={{ paddingLeft:'.875rem' }} type="number" min="0" max="1" step="0.01"
                    placeholder="Ej. 0.35" value={rds} onChange={e=>setRds(e.target.value)} />
                </div>
              </>
            )}
            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Observaciones</label>
              <textarea className="hb-input" style={{ paddingLeft:'.875rem', height:80, resize:'vertical' }}
                placeholder="Comentarios..." value={obs} onChange={e=>setObs(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="cp-btn" style={{ flex:1 }} onClick={() => accion(modal.tipo, modal.id)} disabled={loadingAc}>
                {loadingAc ? <><span className="cp-spinner"/> Procesando...</> : 'Confirmar'}
              </button>
              <button className="cp-btn-ghost" style={{ flex:1 }} onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
