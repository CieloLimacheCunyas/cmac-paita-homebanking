
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitarCredito } from '../../services/creditosService.js'
import { formatMoney, extractError } from '../../utils/format.js'
import Alert from '../../components/ui/Alert.jsx'

const PLAZOS = [6,12,18,24,36]

function calcularCuota(monto, plazo, tea) {
  const tm = Math.pow(1+tea, 1/12) - 1
  return Math.round((monto * tm) / (1 - Math.pow(1+tm,-plazo)) * 100) / 100
}

export default function SolicitarCreditoPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ monto:'', plazo_meses:'12', con_seguro:false, proposito:'' })
  const [error, setError]   = useState(null)
  const [ok, setOk]         = useState(null)
  const [loading,setLoading]= useState(false)

  const tea = form.con_seguro ? 0.4092 : 0.4392
  const cuota = form.monto && parseFloat(form.monto) > 0
    ? calcularCuota(parseFloat(form.monto), parseInt(form.plazo_meses), tea)
    : 0

  const handleChange = (e) => {
    const val = e.target.type==='checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [e.target.name]: val }))
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.monto || parseFloat(form.monto)<500) return setError('Monto minimo S/ 500')
    if (parseFloat(form.monto)>30000) return setError('Monto maximo S/ 30,000')
    setLoading(true)
    try {
      await solicitarCredito({ ...form, monto: parseFloat(form.monto), plazo_meses: parseInt(form.plazo_meses) })
      setOk('Solicitud enviada exitosamente. El asesor la revisara pronto.')
    } catch(err) {
      setError(extractError(err))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth:600, margin:'0 auto' }}>
      <h2 className="cp-page-title">Solicitar Prestamo</h2>
      <p className="cp-page-sub">Credito Empresarial Micro — Cuotas fijas</p>

      <Alert tipo="error">{error}</Alert>
      <Alert tipo="ok">{ok}</Alert>

      {ok ? (
        <div style={{ textAlign:'center', marginTop:'2rem' }}>
          <button className="cp-btn" onClick={() => navigate('/creditos/mis-solicitudes')}>Ver mis solicitudes</button>
        </div>
      ) : (
        <div className="cp-card">
          <div className="cp-card-body">
            <form onSubmit={onSubmit}>
              <div className="hb-field">
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Monto a solicitar (S/)</label>
                <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="monto" type="number"
                  min="500" max="30000" step="100" placeholder="Ej. 5000"
                  value={form.monto} onChange={handleChange} required />
                <small style={{ color:'var(--cp-muted)', fontSize:12 }}>Entre S/ 500 y S/ 30,000</small>
              </div>

              <div className="hb-field">
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Plazo de pago</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                  {PLAZOS.map(p => (
                    <button key={p} type="button"
                      style={{ padding:'10px 0', border:`2px solid ${form.plazo_meses==p?'var(--cp-azul)':'var(--cp-border)'}`,
                               borderRadius:8, background: form.plazo_meses==p?'var(--cp-azul-light)':'#fff',
                               color: form.plazo_meses==p?'var(--cp-azul)':'var(--cp-text)', fontWeight:700, cursor:'pointer', fontSize:13 }}
                      onClick={() => { setForm(f=>({...f,plazo_meses:p})); setError(null) }}>
                      {p}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="hb-field">
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  <input type="checkbox" name="con_seguro" checked={form.con_seguro} onChange={handleChange} style={{ width:18, height:18 }}/>
                  Con seguro de desgravamen (TEA {form.con_seguro?'40.92%':'43.92%'})
                </label>
              </div>

              <div className="hb-field">
                <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Proposito del credito</label>
                <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="proposito" type="text"
                  placeholder="Ej. Capital de trabajo, compra de mercaderia..."
                  value={form.proposito} onChange={handleChange} />
              </div>

              {cuota > 0 && (
                <div style={{ background:'var(--cp-azul)', color:'#fff', borderRadius:10, padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
                  <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>CUOTA MENSUAL ESTIMADA</div>
                  <div style={{ fontSize:28, fontWeight:800 }}>{formatMoney(cuota)}</div>
                  <div style={{ fontSize:12, opacity:.8, marginTop:4 }}>TEA {form.con_seguro?'40.92':'43.92'}% · {form.plazo_meses} cuotas</div>
                </div>
              )}

              <button type="submit" className="cp-btn" style={{ width:'100%' }} disabled={loading}>
                {loading ? <><span className="cp-spinner"/> Enviando...</> : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
