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

// Semáforo scoring
function SemaforoScoring({ scoring }) {
  if (!scoring) return null
  let color, label
  if (scoring >= 700)      { color = '#16a34a'; label = 'BUENO' }
  else if (scoring >= 500) { color = '#d97706'; label = 'REGULAR' }
  else                      { color = '#dc2626'; label = 'MALO' }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
      <div style={{ width:14, height:14, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${color}` }} />
      <span style={{ fontSize:12, fontWeight:700, color }}>Scoring: {scoring} — {label}</span>
    </div>
  )
}

// Semáforo RDS
function SemaforoRDS({ rds }) {
  if (!rds) return null
  const pct = parseFloat(rds) * 100
  let color, label
  if (pct <= 30)      { color = '#16a34a'; label = 'BAJO RIESGO' }
  else if (pct <= 50) { color = '#d97706'; label = 'RIESGO MEDIO' }
  else                 { color = '#dc2626'; label = 'ALTO RIESGO' }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
      <div style={{ width:14, height:14, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${color}` }} />
      <span style={{ fontSize:12, fontWeight:700, color }}>RDS: {pct.toFixed(1)}% — {label}</span>
    </div>
  )
}

// Elegibilidad
function Elegibilidad({ monto, scoring, rds }) {
  if (!scoring || !rds) return null
  const pct = parseFloat(rds) * 100
  const elegible = scoring >= 500 && pct <= 60

  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background: elegible ? '#ECFDF5' : '#FEF2F2',
      color: elegible ? '#065F46' : '#991B1B',
      padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, marginTop:6
    }}>
      {elegible ? '✅ SUJETO DE CREDITO' : '❌ NO ELEGIBLE'}
    </div>
  )
}

// Umbral comité
function UmbralComite({ monto }) {
  const m = parseFloat(monto)
  let nivel
  if (m <= 5000)       nivel = { label:'Sin comité — Admin decide', color:'#1D4ED8' }
  else if (m <= 15000) nivel = { label:'Comité básico requerido', color:'#d97706' }
  else                  nivel = { label:'Comité pleno requerido', color:'#dc2626' }

  return (
    <div style={{ fontSize:11, fontWeight:600, color: nivel.color, marginTop:4 }}>
      🏦 {nivel.label}
    </div>
  )
}

export default function BandejaPage() {
  const { user }  = useHBAuth()
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
      if (tipo==='evaluar')     await evaluar(id, { scoring:parseInt(scoring), rds:parseFloat(rds), obs })
      if (tipo==='aprobar')     await aprobar(id, { obs })
      if (tipo==='rechazar')    await rechazar(id, { obs })
      if (tipo==='desembolsar') await desembolsar(id)
      setOk('Accion realizada exitosamente')
      setModal(null); cargar()
    } catch(err) { setError(extractError(err)) }
    finally { setLoadingAc(false) }
  }

  const FILTROS = ['','enviado','en_evaluacion','aprobado','rechazado','desembolsado']

  // Validar si puede aprobar según umbral
  const puedeAprobar = (s) => {
    const m = parseFloat(s.monto)
    if (m <= 5000)  return ['admin','gerencia'].includes(user?.rol)
    if (m <= 15000) return ['admin','comite','gerencia'].includes(user?.rol)
    return ['comite','gerencia'].includes(user?.rol)
  }

  return (
    <div>
      <h2 className="cp-page-title">Bandeja de Creditos</h2>
      <p className="cp-page-sub">Gestion de solicitudes — rol: <strong>{user?.rol}</strong></p>

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
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:16 }}>{s.nombres} {s.apellidos}</div>
                  <div style={{ color:'var(--cp-muted)', fontSize:13 }}>DNI: {s.dni} · {s.producto}</div>
                  <div style={{ marginTop:6, fontWeight:700, fontSize:18, color:'var(--cp-azul)' }}>{formatMoney(s.monto)}</div>
                  <div style={{ color:'var(--cp-muted)', fontSize:13 }}>{s.plazo_meses} meses · Cuota {formatMoney(s.cuota_mensual)}</div>
                  {s.proposito && <div style={{ color:'var(--cp-muted)', fontSize:12, marginTop:4 }}>{s.proposito}</div>}

                  {/* Semáforos */}
                  <SemaforoScoring scoring={s.scoring} />
                  <SemaforoRDS rds={s.rds} />
                  <Elegibilidad monto={s.monto} scoring={s.scoring} rds={s.rds} />
                  <UmbralComite monto={s.monto} />
                </div>

                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                  <span style={{ background:bg, color, padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700 }}>{s.estado}</span>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {user?.rol==='riesgos' && s.estado==='enviado' && (
                      <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px' }}
                        onClick={() => { setModal({tipo:'evaluar',id:s.id}); setObs(''); setError(null) }}>
                        Evaluar
                      </button>
                    )}
                    {puedeAprobar(s) && s.estado==='en_evaluacion' && (
                      <>
                        <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px' }}
                          onClick={() => { setModal({tipo:'aprobar',id:s.id}); setObs(''); setError(null) }}>
                          Aprobar
                        </button>
                        <button className="cp-btn-ghost" style={{ fontSize:12, padding:'6px 12px' }}
                          onClick={() => { setModal({tipo:'rechazar',id:s.id}); setObs(''); setError(null) }}>
                          Rechazar
                        </button>
                      </>
                    )}
                    {['admin','gerencia'].includes(user?.rol) && s.estado==='aprobado' && (
                      <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px', background:'var(--cp-naranja)' }}
                        onClick={() => accion('desembolsar',s.id)}>
                        Desembolsar
                      </button>
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
          <div style={{ background:'#fff', borderRadius:16, padding:'2rem', width:'100%', maxWidth:440, margin:'0 1rem' }}>
            <h3 style={{ margin:'0 0 1rem', fontWeight:700, fontSize:'1.1rem', textTransform:'capitalize' }}>
              {modal.tipo} solicitud
            </h3>
            <Alert tipo="error">{error}</Alert>

            {modal.tipo==='evaluar' && (
              <>
                <div className="hb-field">
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>
                    Scoring (0-1000)
                  </label>
                  <input className="hb-input" style={{ paddingLeft:'.875rem' }} type="number" min="0" max="1000"
                    placeholder="Ej. 720" value={scoring} onChange={e=>setScoring(e.target.value)} />
                  {scoring && (
                    <div style={{ marginTop:6 }}>
                      <SemaforoScoring scoring={parseInt(scoring)} />
                    </div>
                  )}
                </div>

                <div className="hb-field">
                  <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>
                    RDS — Razon Deuda/Ingreso (0.00 a 1.00)
                  </label>
                  <input className="hb-input" style={{ paddingLeft:'.875rem' }} type="number" min="0" max="1" step="0.01"
                    placeholder="Ej. 0.35" value={rds} onChange={e=>setRds(e.target.value)} />
                  {rds && (
                    <div style={{ marginTop:6 }}>
                      <SemaforoRDS rds={parseFloat(rds)} />
                    </div>
                  )}
                </div>

                {scoring && rds && (
                  <div style={{ marginBottom:12 }}>
                    <Elegibilidad monto={999999} scoring={parseInt(scoring)} rds={parseFloat(rds)} />
                  </div>
                )}
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