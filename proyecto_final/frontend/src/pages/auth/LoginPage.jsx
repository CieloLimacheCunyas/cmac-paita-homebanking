import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, Lock, LogIn, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react'
import { useHBAuth } from '../../hooks/useHBAuth.js'
import { extractError } from '../../utils/format.js'
import Alert from '../../components/ui/Alert.jsx'

const ROLES = ['Cliente', 'Asesor', 'Admin', 'Riesgos']

function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function LoginPage() {
  const { login, isAuthenticated } = useHBAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rolSel,   setRolSel]   = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [captcha,  setCaptcha]  = useState(() => generarCodigo())
  const [inputCaptcha, setInputCaptcha] = useState('')

  useEffect(() => { if (isAuthenticated) navigate('/inicio', { replace: true }) }, [isAuthenticated])

  const refrescarCaptcha = () => {
    setCaptcha(generarCodigo())
    setInputCaptcha('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!username.trim()) { setError('Ingresa tu usuario'); return }
    if (inputCaptcha.toUpperCase() !== captcha) {
      setError('Codigo de seguridad incorrecto')
      refrescarCaptcha()
      return
    }
    setLoading(true)
    try {
      const u = await login(username.trim(), password)
      const rutas = { cliente:'/inicio', asesor:'/inicio', admin:'/inicio', riesgos:'/inicio', comite:'/inicio', gerencia:'/inicio' }
      navigate(rutas[u.rol] || '/inicio', { replace: true })
    } catch (err) {
      setError(extractError(err, 'No se pudo iniciar sesion.'))
      refrescarCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hb-login-bg">
      <div className="hb-login-brand">
        <div className="brand-content">
          <img src="/logo.png" alt="CMAC Paita" style={{ height:64, objectFit:"contain", marginBottom:"1.5rem", filter:"brightness(0) invert(1)" }} />
          <h1 className="brand-titulo">CMAC Paita</h1>
          <p className="brand-subtitulo">Caja Municipal de Ahorro y Credito</p>
          <div className="brand-sep" />
          <p className="brand-slogan">"Tu aliado financiero en el norte del Peru"</p>
          <div className="brand-stats">
            <div><span className="stat-num">+30 años</span><span className="stat-label">de experiencia</span></div>
            <div><span className="stat-num">+50,000</span><span className="stat-label">clientes</span></div>
            <div><span className="stat-num">S/ 500M</span><span className="stat-label">en creditos</span></div>
          </div>
        </div>
        <div className="brand-footer">© 2024 CMAC Paita · Supervisada por la SBS</div>
      </div>

      <div className="hb-login-form-panel">
        <div className="hb-login-card">
          <div className="hb-login-franja" />
          <div style={{ textAlign:'center', marginBottom:22 }}>
            <img src="/logo.png" alt="CMAC Paita" style={{ height:60, objectFit:"contain", margin:"0 auto 12px", display:"block" }} />
            <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:700 }}>Bienvenido</h2>
            <p style={{ margin:'4px 0 0', color:'var(--cp-muted)', fontSize:13 }}>Ingresa con tu usuario y clave</p>
          </div>

          <div className="demo-box" style={{ marginBottom:16 }}>
            <div className="demo-label">¿Quién ingresa?</div>
            <div className="demo-grid">
              {ROLES.map(rol => (
                <button key={rol} type="button" className="demo-btn"
                  style={{
                    borderColor: rolSel===rol ? 'var(--cp-azul)' : '',
                    background:  rolSel===rol ? 'var(--cp-azul-light)' : '',
                    fontWeight:  rolSel===rol ? 800 : 600
                  }}
                  onClick={() => setRolSel(rol)}>
                  {rol}
                </button>
              ))}
            </div>
          </div>

          <Alert tipo="error">{error}</Alert>

          <form onSubmit={onSubmit}>
            <div className="hb-field">
              <label>Usuario de banca</label>
              <div className="hb-input-wrap">
                <CreditCard size={18} className="hb-input-icon" />
                <input className="hb-input" placeholder="Escribe tu usuario"
                  autoComplete="username" value={username}
                  onChange={e => { setUsername(e.target.value); setError(null) }} required />
              </div>
            </div>

            <div className="hb-field">
              <label>
                <span>Clave de internet</span>
                <a href="#" className="hb-field-link">¿Olvidaste tu clave?</a>
              </label>
              <div className="hb-input-wrap">
                <Lock size={18} className="hb-input-icon" />
                <input className="hb-input" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="hb-input-icon-r" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="hb-field">
              <label><ShieldCheck size={14} style={{marginRight:4}}/> Codigo de seguridad</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{
                  background:'#1a2b3c',
                  color:'#fff',
                  padding:'10px 18px',
                  borderRadius:8,
                  fontFamily:'monospace',
                  fontSize:22,
                  fontWeight:800,
                  letterSpacing:6,
                  userSelect:'none',
                  textDecoration:'line-through wavy rgba(255,255,255,0.15)',
                  position:'relative',
                  minWidth:130,
                  textAlign:'center',
                  background: 'linear-gradient(135deg, #1a2b3c 0%, #005A9C 100%)',
                  textShadow:'1px 1px 2px rgba(0,0,0,0.5)',
                  border:'2px solid var(--cp-border)'
                }}>
                  {captcha}
                </div>
                <button type="button" onClick={refrescarCaptcha}
                  style={{ background:'none', border:'1.5px solid var(--cp-border)', borderRadius:8, padding:'8px 12px', cursor:'pointer', color:'var(--cp-azul)', display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600 }}>
                  <RefreshCw size={16}/> Nuevo
                </button>
              </div>
              <div className="hb-input-wrap">
                <ShieldCheck size={18} className="hb-input-icon" />
                <input className="hb-input" placeholder="Escribe el codigo"
                  value={inputCaptcha}
                  onChange={e => { setInputCaptcha(e.target.value.toUpperCase()); setError(null) }}
                  maxLength={6} required />
              </div>
            </div>

            <button type="submit" className="hb-btn" disabled={loading}>
              <LogIn size={18} />
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="hb-login-hint">
            ¿No tienes cuenta? <Link to="/registro">Registrate aqui</Link>
          </p>
        </div>
      </div>
    </div>
  )
}