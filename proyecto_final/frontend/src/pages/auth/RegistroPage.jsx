import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useHBAuth } from '../../hooks/useHBAuth.js'
import { extractError } from '../../utils/format.js'
import * as authService from '../../services/authService.js'
import Alert from '../../components/ui/Alert.jsx'

export default function RegistroPage() {
  const { login } = useHBAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ dni:'', nombres:'', apellidos:'', email:'', password:'', telefono:'' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(null) }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{8}$/.test(form.dni)) { setError('El DNI debe tener exactamente 8 digitos'); return }
    if (form.password.length < 8)   { setError('La contrasena debe tener minimo 8 caracteres'); return }
    setLoading(true)
    try {
      const { token, user } = await authService.registro(form)
      authService.saveSession(token, user)
      navigate('/inicio', { replace: true })
    } catch (err) {
      setError(extractError(err, 'Error al registrarse'))
    } finally { setLoading(false) }
  }

  const campos = [
    { name:'dni',       label:'DNI *',              placeholder:'12345678',     maxLength:8 },
    { name:'telefono',  label:'Telefono',            placeholder:'999 888 777'              },
    { name:'nombres',   label:'Nombres *',           placeholder:'Carlos'                   },
    { name:'apellidos', label:'Apellidos *',         placeholder:'Garcia Lopez'             },
  ]

  return (
    <div className="hb-login-bg">
      <div className="hb-login-brand">
        <div className="brand-content">
          <div className="brand-logo-circle">CP</div>
          <h1 className="brand-titulo">Unete a CMAC Paita</h1>
          <p className="brand-subtitulo">Crea tu cuenta gratis</p>
          <div className="brand-sep" />
          <p className="brand-slogan">Accede a todos nuestros productos financieros desde cualquier lugar.</p>
        </div>
        <div className="brand-footer">© 2024 CMAC Paita · Supervisada por la SBS</div>
      </div>

      <div className="hb-login-form-panel">
        <div className="hb-login-card" style={{ maxWidth:480 }}>
          <div className="hb-login-franja" />
          <h2 style={{ margin:'0 0 4px', fontSize:'1.5rem', fontWeight:700 }}>Crear cuenta</h2>
          <p style={{ margin:'0 0 1.5rem', color:'var(--cp-muted)', fontSize:13 }}>Completa tus datos personales</p>

          <Alert tipo="error">{error}</Alert>

          <form onSubmit={onSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
              {campos.map(c => (
                <div className="hb-field" key={c.name}>
                  <label>{c.label}</label>
                  <div className="hb-input-wrap">
                    <input className="hb-input" style={{ paddingLeft:'.875rem' }} name={c.name}
                      value={form[c.name]} onChange={handleChange}
                      placeholder={c.placeholder} maxLength={c.maxLength} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hb-field">
              <label>Correo electronico *</label>
              <div className="hb-input-wrap">
                <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="email" type="email"
                  value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
              </div>
            </div>

            <div className="hb-field">
              <label>Contrasena * <span style={{ fontWeight:400, color:'var(--cp-muted)', fontSize:12 }}>(min. 8 caracteres)</span></label>
              <div className="hb-input-wrap">
                <input className="hb-input" style={{ paddingLeft:'.875rem' }} name="password" type="password"
                  value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" className="hb-btn" disabled={loading}>
              {loading ? <><span className="cp-spinner" /> Registrando...</> : 'Crear cuenta'}
            </button>
          </form>

          <p className="hb-login-hint">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
