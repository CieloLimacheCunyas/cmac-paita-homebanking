import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { CreditCard, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { useHBAuth } from '../../hooks/useHBAuth.js'
import { extractError } from '../../utils/format.js'
import Alert from '../../components/ui/Alert.jsx'

    return (
    <div className="hb-login-bg">
      {/* Panel izquierdo — Branding */}
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

      {/* Panel derecho — Formulario */}
      <div className="hb-login-form-panel">
        <div className="hb-login-card">
          <div className="hb-login-franja" />

          <div style={{ textAlign:'center', marginBottom:22 }}>
            <img src="/logo.png" alt="CMAC Paita" style={{ height:60, objectFit:"contain", margin:"0 auto 12px", display:"block" }} />
            <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:700 }}>Bienvenido</h2>
            <p style={{ margin:'4px 0 0', color:'var(--cp-muted)', fontSize:13 }}>Ingresa con tu usuario y clave</p>
          </div>

          <Alert tipo="error">{error}</Alert>

          <form onSubmit={onSubmit}>
            <div className="hb-field">
              <label>Usuario de banca</label>
              <div className="hb-input-wrap">
                <CreditCard size={18} className="hb-input-icon" />
                <input className="hb-input" placeholder="Ej. cli000001"
                  autoComplete="username" value={username}
                  onChange={e => setUsername(e.target.value)} autoFocus required />
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

            <button type="submit" className="hb-btn" disabled={loading}>
              <LogIn size={18} />
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="hb-login-hint">
            ¿No tienes cuenta? <Link to="/registro">Registrate aqui</Link>
          </p>

          <div className="demo-box">
            <div className="demo-label">Accesos de demostración · clave: Paita2024!</div>
            <div className="demo-grid">
              {DEMOS.map(d => (
                <button key={d.rol} className="demo-btn" onClick={() => usarDemo(d.username)}>
                  {d.rol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
