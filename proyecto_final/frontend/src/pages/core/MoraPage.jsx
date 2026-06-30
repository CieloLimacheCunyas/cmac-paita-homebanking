
import { useState, useEffect } from 'react'
import { getCarteraMora, registrarGestion, getHistorial, transicionarEstado } from '../../services/creditosService.js'
import { formatMoney, extractError } from '../../utils/format.js'
import { useHBAuth } from '../../hooks/useHBAuth.js'
import Loader from '../../components/ui/Loader.jsx'
import Alert from '../../components/ui/Alert.jsx'

const BANDAS = {
  preventiva: ['#EFF6FF','#1D4ED8','0 dias'],
  temprana:   ['#FEF9C3','#854D0E','1-30 dias'],
  tardia:     ['#FEF3C7','#92400E','31-90 dias'],
  judicial:   ['#FEF2F2','#991B1B','91-180 dias'],
  castigo:    ['#1F2937','#F9FAFB','+180 dias'],
}

export default function MoraPage() {
  const { user }  = useHBAuth()
  const [cartera, setCartera]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [sel,     setSel]       = useState(null)
  const [historial,setHistorial]= useState([])
  const [modal,   setModal]     = useState(null)
  const [form,    setForm]      = useState({ tipo:'llamada', descripcion:'', resultado:'' })
  const [error,   setError]     = useState(null)
  const [ok,      setOk]        = useState(null)
  const [loading2,setLoading2]  = useState(false)

  const cargar = async () => {
    setLoading(true)
    try { setCartera(await getCarteraMora()) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const verHistorial = async (cred) => {
    setSel(cred)
    const h = await getHistorial(cred.id)
    setHistorial(h)
  }

  const registrar = async () => {
    if (!form.descripcion) return setError('Ingresa una descripcion')
    setLoading2(true); setError(null)
    try {
      await registrarGestion(sel.id, form)
      setOk('Gestion registrada')
      setModal(null)
      const h = await getHistorial(sel.id)
      setHistorial(h)
    } catch(err) { setError(extractError(err)) }
    finally { setLoading2(false) }
  }

  const transicionar = async (nuevoEstado) => {
    setLoading2(true); setError(null)
    try {
      await transicionarEstado(sel.id, nuevoEstado)
      setOk(`Credito pasado a ${nuevoEstado}`)
      cargar()
      setSel(null)
    } catch(err) { setError(extractError(err)) }
    finally { setLoading2(false) }
  }

  const kpis = {
    preventiva: cartera.filter(c=>c.banda==='preventiva').length,
    temprana:   cartera.filter(c=>c.banda==='temprana').length,
    tardia:     cartera.filter(c=>c.banda==='tardia').length,
    judicial:   cartera.filter(c=>c.banda==='judicial').length,
    castigo:    cartera.filter(c=>c.banda==='castigo').length,
  }

  return (
    <div>
      <h2 className="cp-page-title">Recuperaciones / Mora</h2>
      <p className="cp-page-sub">Gestion de cartera morosa por bandas</p>

      <Alert tipo="ok">{ok}</Alert>
      <Alert tipo="error">{error}</Alert>

      {/* KPIs por banda */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:18 }}>
        {Object.entries(BANDAS).map(([banda,[bg,color,rango]]) => (
          <div key={banda} style={{ background:bg, borderRadius:10, padding:'12px', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{kpis[banda]}</div>
            <div style={{ fontSize:11, fontWeight:600, color, marginTop:2, textTransform:'capitalize' }}>{banda}</div>
            <div style={{ fontSize:10, color, opacity:.8 }}>{rango}</div>
          </div>
        ))}
      </div>

      {loading && <Loader text="Cargando cartera..." />}

      <div style={{ display:'grid', gridTemplateColumns: sel?'1fr 1fr':'1fr', gap:16 }}>
        <div>
          {cartera.map(c => {
            const [bg,color] = BANDAS[c.banda] || ['#F3F4F6','#374151']
            return (
              <div key={c.id} className="cp-card" style={{ marginBottom:10, cursor:'pointer', border: sel?.id===c.id?'2px solid var(--cp-azul)':'1px solid var(--cp-border)' }}
                onClick={() => verHistorial(c)}>
                <div className="cp-card-body">
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{c.nombres} {c.apellidos}</div>
                      <div style={{ fontSize:12, color:'var(--cp-muted)' }}>{c.numero_credito} · DNI: {c.dni}</div>
                      <div style={{ fontSize:13, marginTop:4 }}>Saldo: <strong>{formatMoney(c.saldo_pendiente)}</strong></div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ background:bg, color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{c.banda}</span>
                      <div style={{ fontSize:12, color:'var(--cp-muted)', marginTop:4 }}>{c.dias_atraso} dias</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sel && (
          <div>
            <div className="cp-card">
              <div className="cp-card-head">
                <h3 style={{ fontSize:14 }}>{sel.nombres} {sel.apellidos}</h3>
                <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--cp-muted)' }} onClick={()=>setSel(null)}>✕</button>
              </div>
              <div className="cp-card-body">
                <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                  <button className="cp-btn" style={{ fontSize:12, padding:'6px 12px' }} onClick={() => { setModal(true); setForm({ tipo:'llamada', descripcion:'', resultado:'' }); setError(null) }}>
                    + Registrar gestion
                  </button>
                  {['admin','riesgos','gerencia'].includes(user?.rol) && sel.dias_atraso >= 121 && sel.estado!=='judicial' && (
                    <button className="cp-btn-ghost" style={{ fontSize:12, padding:'6px 12px', color:'#991B1B', borderColor:'#991B1B' }}
                      onClick={() => transicionar('judicial')}>→ Judicial</button>
                  )}
                  {['admin','gerencia'].includes(user?.rol) && sel.dias_atraso > 180 && sel.estado!=='castigado' && (
                    <button className="cp-btn-ghost" style={{ fontSize:12, padding:'6px 12px', color:'#4B5563', borderColor:'#4B5563' }}
                      onClick={() => transicionar('castigado')}>→ Castigar</button>
                  )}
                </div>

                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>Historial de gestiones</div>
                {historial.length === 0 && <p className="cp-empty" style={{ padding:'10px 0' }}>Sin gestiones registradas.</p>}
                {historial.map(g => (
                  <div key={g.id} style={{ padding:'8px 0', borderBottom:'1px solid var(--cp-border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontWeight:600, fontSize:13 }}>{g.tipo}</span>
                      <span style={{ fontSize:11, color:'var(--cp-muted)' }}>{new Date(g.creado_en).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--cp-muted)' }}>{g.descripcion}</div>
                    {g.resultado && <div style={{ fontSize:11, color:'var(--cp-azul)', marginTop:2 }}>Resultado: {g.resultado}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'2rem', width:'100%', maxWidth:400, margin:'0 1rem' }}>
            <h3 style={{ margin:'0 0 1rem', fontWeight:700 }}>Registrar gestion</h3>
            <Alert tipo="error">{error}</Alert>
            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Tipo de gestion</label>
              <select className="hb-input" style={{ paddingLeft:'.875rem' }} value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
                {['llamada','visita','carta','email','whatsapp'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Descripcion *</label>
              <textarea className="hb-input" style={{ paddingLeft:'.875rem', height:70, resize:'vertical' }}
                value={form.descripcion} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} placeholder="Detalle de la gestion..." />
            </div>
            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Resultado</label>
              <input className="hb-input" style={{ paddingLeft:'.875rem' }} value={form.resultado}
                onChange={e=>setForm(p=>({...p,resultado:e.target.value}))} placeholder="Ej. Promesa de pago viernes" />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="cp-btn" style={{ flex:1 }} onClick={registrar} disabled={loading2}>
                {loading2?<><span className="cp-spinner"/>Guardando...</>:'Guardar'}
              </button>
              <button className="cp-btn-ghost" style={{ flex:1 }} onClick={()=>setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
