
import { useState, useEffect } from 'react'
import { CreditCard, ChevronDown, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { getMisCreditos, getCuotas } from '../../services/creditosService.js'
import { formatMoney } from '../../utils/format.js'
import Loader from '../../components/ui/Loader.jsx'

const estadoBadge = (e) => {
  const map = { pagada:['#ECFDF5','#065F46'], pendiente:['#EFF6FF','#1D4ED8'], vencida:['#FEF2F2','#991B1B'] }
  const [bg, color] = map[e] || ['#F3F4F6','#374151']
  return <span style={{ background:bg, color, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>{e}</span>
}

export default function CreditosPage() {
  const [creditos, setCreditos] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [abierto,  setAbierto]  = useState(null)
  const [cuotas,   setCuotas]   = useState([])
  const [loadingC, setLoadingC] = useState(false)

  useEffect(() => {
    getMisCreditos().then(setCreditos).finally(() => setLoading(false))
  }, [])

  const toggleCredito = async (cred) => {
    if (abierto === cred.id) { setAbierto(null); return }
    setAbierto(cred.id); setLoadingC(true)
    try { setCuotas(await getCuotas(cred.id)) }
    catch { setCuotas([]) }
    finally { setLoadingC(false) }
  }

  const totalDeuda = creditos.reduce((s,c) => s + parseFloat(c.saldo_pendiente), 0)

  return (
    <div>
      <h2 className="cp-page-title">Mis Prestamos</h2>
      <p className="cp-page-sub">Consulta tus creditos y cronograma de pagos</p>

      {loading && <Loader text="Cargando creditos..." />}

      {!loading && creditos.length === 0 && (
        <div className="cp-card"><div className="cp-card-body"><p className="cp-empty">No tienes creditos vigentes.</p></div></div>
      )}

      {creditos.length > 0 && (
        <div style={{ background:'var(--cp-naranja)', color:'#fff', borderRadius:'var(--cp-radius)', padding:'1.25rem 1.5rem', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>DEUDA TOTAL PENDIENTE</div>
            <div style={{ fontSize:28, fontWeight:800 }}>{formatMoney(totalDeuda)}</div>
          </div>
          <CreditCard size={40} style={{ opacity:.4 }} />
        </div>
      )}

      {creditos.map(cred => (
        <div key={cred.id} className="cp-card" style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', cursor:'pointer' }}
            onClick={() => toggleCredito(cred)}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'#FEF3E8', color:'var(--cp-naranja)', display:'grid', placeItems:'center' }}>
                <CreditCard size={22}/>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{cred.numero_credito}</div>
                <div style={{ fontSize:12, color:'var(--cp-muted)' }}>
                  {cred.plazo_meses} meses · TEA {(parseFloat(cred.tea)*100).toFixed(2)}%
                  <span style={{ marginLeft:8, background: cred.estado==='vigente'?'#ECFDF5':'#FEF2F2', color: cred.estado==='vigente'?'#065F46':'#991B1B', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                    {cred.estado}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:13, color:'var(--cp-muted)' }}>Saldo pendiente</div>
                <div style={{ fontSize:20, fontWeight:800, color:'var(--cp-naranja)' }}>{formatMoney(cred.saldo_pendiente)}</div>
                <div style={{ fontSize:12, color:'var(--cp-muted)' }}>Cuota: {formatMoney(cred.cuota_mensual)}/mes</div>
              </div>
              <ChevronDown size={20} style={{ color:'var(--cp-muted)', transform: abierto===cred.id?'rotate(180deg)':'none', transition:'transform .2s' }}/>
            </div>
          </div>

          {abierto === cred.id && (
            <div style={{ borderTop:'1px dashed var(--cp-border)', padding:'1rem 1.25rem' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Cronograma de pagos</div>
              {loadingC && <Loader text="Cargando cronograma..." />}
              {!loadingC && (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'var(--cp-azul-light)' }}>
                        {['N°','Fecha','Cuota','Capital','Interes','Saldo','Estado'].map(h => (
                          <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:700, color:'var(--cp-azul)', fontSize:12 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cuotas.map((q,i) => (
                        <tr key={q.nro_cuota} style={{ background: i%2===0?'#fff':'#FAFAFA', borderBottom:'1px solid var(--cp-border)' }}>
                          <td style={{ padding:'8px 10px', fontWeight:600 }}>{q.nro_cuota}</td>
                          <td style={{ padding:'8px 10px' }}>{new Date(q.fecha_venc).toLocaleDateString('es-PE')}</td>
                          <td style={{ padding:'8px 10px', fontWeight:600 }}>{formatMoney(q.cuota)}</td>
                          <td style={{ padding:'8px 10px' }}>{formatMoney(q.capital)}</td>
                          <td style={{ padding:'8px 10px' }}>{formatMoney(q.interes)}</td>
                          <td style={{ padding:'8px 10px' }}>{formatMoney(q.saldo)}</td>
                          <td style={{ padding:'8px 10px' }}>{estadoBadge(q.estado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
