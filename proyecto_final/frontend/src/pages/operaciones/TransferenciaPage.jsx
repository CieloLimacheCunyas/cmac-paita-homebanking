
import { useState } from 'react'
import { Send } from 'lucide-react'
import { useCuentas } from '../../hooks/useCuentas.js'
import { transferir } from '../../services/operacionesService.js'
import { formatMoney, extractError } from '../../utils/format.js'
import Alert from '../../components/ui/Alert.jsx'

export default function TransferenciaPage() {
  const { cuentas } = useCuentas()
  const [form, setForm]     = useState({ cuenta_origen_id:'', numero_cuenta_destino:'', monto:'', descripcion:'' })
  const [error, setError]   = useState(null)
  const [ok, setOk]         = useState(null)
  const [loading,setLoading]= useState(false)

  const handleChange = (e) => { setForm(p=>({...p,[e.target.name]:e.target.value})); setError(null) }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.cuenta_origen_id || !form.numero_cuenta_destino || !form.monto)
      return setError('Completa todos los campos')
    if (parseFloat(form.monto) <= 0) return setError('Monto invalido')
    setLoading(true)
    try {
      const data = await transferir({ ...form, monto: parseFloat(form.monto) })
      setOk(`Transferencia exitosa. Referencia: ${data.referencia}`)
      setForm({ cuenta_origen_id:'', numero_cuenta_destino:'', monto:'', descripcion:'' })
    } catch(err) {
      setError(extractError(err))
    } finally { setLoading(false) }
  }

  const cuentaOrigen = cuentas.find(c => c.id === parseInt(form.cuenta_origen_id))

  return (
    <div style={{ maxWidth:560, margin:'0 auto' }}>
      <h2 className="cp-page-title">Transferencias</h2>
      <p className="cp-page-sub">Transfiere dinero entre cuentas CMAC Paita</p>

      <Alert tipo="error">{error}</Alert>
      <Alert tipo="ok">{ok}</Alert>

      <div className="cp-card">
        <div className="cp-card-body">
          <form onSubmit={onSubmit}>
            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Cuenta origen</label>
              <select className="hb-input" style={{ paddingLeft:'.875rem' }} name="cuenta_origen_id"
                value={form.cuenta_origen_id} onChange={handleChange} required>
                <option value="">Selecciona una cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cuenta} — {formatMoney(c.saldo)}</option>
                ))}
              </select>
              {cuentaOrigen && <small style={{ color:'var(--cp-muted)', fontSize:12 }}>Saldo disponible: {formatMoney(cuentaOrigen.saldo)}</small>}
            </div>

            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>N° cuenta destino</label>
              <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="numero_cuenta_destino" type="text"
                placeholder="Ej. 1000000012345678" value={form.numero_cuenta_destino} onChange={handleChange} required />
            </div>

            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Monto (S/)</label>
              <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="monto" type="number"
                min="1" step="0.01" placeholder="0.00" value={form.monto} onChange={handleChange} required />
            </div>

            <div className="hb-field">
              <label style={{ display:'block', fontWeight:600, fontSize:13, marginBottom:6 }}>Descripcion (opcional)</label>
              <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="descripcion" type="text"
                placeholder="Ej. Pago alquiler" value={form.descripcion} onChange={handleChange} />
            </div>

            <button type="submit" className="cp-btn" style={{ width:'100%', gap:8 }} disabled={loading}>
              {loading ? <><span className="cp-spinner"/> Procesando...</> : <><Send size={18}/> Transferir</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
