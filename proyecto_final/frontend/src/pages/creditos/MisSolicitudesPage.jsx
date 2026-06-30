
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import { getMisSolicitudes } from '../../services/creditosService.js'
import { formatMoney } from '../../utils/format.js'
import Loader from '../../components/ui/Loader.jsx'

const ESTADOS = {
  enviado:       ['#EFF6FF','#1D4ED8','Enviado'],
  en_evaluacion: ['#FEF9C3','#854D0E','En evaluacion'],
  aprobado:      ['#ECFDF5','#065F46','Aprobado'],
  rechazado:     ['#FEF2F2','#991B1B','Rechazado'],
  desembolsado:  ['#F0FDF4','#166534','Desembolsado'],
}

export default function MisSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading]         = useState(true)
  const navigate = useNavigate()

  useEffect(() => { getMisSolicitudes().then(setSolicitudes).finally(()=>setLoading(false)) }, [])

  if (loading) return <Loader text="Cargando solicitudes..." />

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h2 className="cp-page-title">Mis Solicitudes</h2>
          <p className="cp-page-sub">Historial de solicitudes de credito</p>
        </div>
        <button className="cp-btn" onClick={() => navigate('/creditos/solicitar')} style={{ gap:8 }}>
          <FilePlus2 size={18}/> Nueva solicitud
        </button>
      </div>

      {solicitudes.length === 0 && (
        <div className="cp-card"><div className="cp-card-body">
          <p className="cp-empty">No tienes solicitudes de credito.</p>
          <div style={{ textAlign:'center', marginTop:12 }}>
            <button className="cp-btn" onClick={() => navigate('/creditos/solicitar')}>Solicitar credito</button>
          </div>
        </div></div>
      )}

      {solicitudes.map(s => {
        const [bg,color,label] = ESTADOS[s.estado] || ['#F3F4F6','#374151',s.estado]
        return (
          <div key={s.id} className="cp-card" style={{ marginBottom:12 }}>
            <div className="cp-card-body">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{formatMoney(s.monto)}</div>
                  <div style={{ color:'var(--cp-muted)', fontSize:13, marginTop:2 }}>
                    {s.plazo_meses} meses · Cuota {formatMoney(s.cuota_mensual)}/mes
                  </div>
                  {s.proposito && <div style={{ color:'var(--cp-muted)', fontSize:12, marginTop:4 }}>{s.proposito}</div>}
                  {s.obs_admin && (
                    <div style={{ marginTop:8, padding:'6px 10px', background:'#FEF9C3', borderRadius:8, fontSize:12, color:'#854D0E' }}>
                      Observacion: {s.obs_admin}
                    </div>
                  )}
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ background:bg, color, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{label}</span>
                  <div style={{ color:'var(--cp-muted)', fontSize:11, marginTop:6 }}>
                    {new Date(s.fecha_solicitud).toLocaleDateString('es-PE')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
