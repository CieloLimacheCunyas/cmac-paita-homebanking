import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useHBAuth } from '../../hooks/useHBAuth.js'

const TABS_CLIENTE = [
  { label:'Inicio',      to:'/inicio',                  match:['/inicio'] },
  { label:'Cuentas',     to:'/cuentas/ahorro',          match:['/cuentas'] },
  { label:'Prestamos',   to:'/cuentas/credito',         match:['/cuentas/credito','/creditos'] },
  { label:'Operaciones', to:'/operaciones/transferencia',match:['/operaciones'] },
]

const TABS_CORE = [
  { label:'Bandeja',      to:'/core/bandeja', match:['/core/bandeja','/core/evaluacion','/core/comite','/core/reportes'] },
  { label:'Mora',         to:'/core/mora',    match:['/core/mora'] },
]

export default function Header() {
  const { user, logout }  = useHBAuth()
  const navigate           = useNavigate()
  const location           = useLocation()
  const [menuOpen,setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/', { replace:true }) }

  const iniciales = (user?.nombres||'C').split(/[\s,]+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase()
  const esCliente = user?.rol === 'cliente'
  const TABS = esCliente ? TABS_CLIENTE : TABS_CORE
  const isActive = (tab) => tab.match.some(m => location.pathname.startsWith(m))

  return (
    <header className="cp-header">
      <div className="cp-franja-top" />
      <div className="cp-header-top">
        <button className="cp-logo" onClick={() => navigate(esCliente?'/inicio':'/core/bandeja')}>
          <img src="/logo.png" alt="CMAC Paita" style={{ height:52, objectFit:"contain", filter:"brightness(0) invert(1)" }} />
          <span style={{ fontSize:11, opacity:.9, letterSpacing:".5px", fontWeight:600 }}>BANCA POR INTERNET</span>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="cp-header-user">
            <strong>{user?.nombres} {user?.apellidos}</strong>
            <div style={{ opacity:.8, fontSize:12 }}>{user?.username} · {user?.rol}</div>
          </div>
          <div style={{ position:'relative' }}>
            <button style={{ background:'rgba(255,255,255,.2)', border:'none', color:'#fff', width:38, height:38, borderRadius:'50%', fontWeight:800, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setMenuOpen(v=>!v)}>{iniciales}</button>
            {menuOpen && (
              <div style={{ position:'absolute', top:'110%', right:0, background:'#fff', color:'var(--cp-text)', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.18)', minWidth:180, padding:6, zIndex:70, border:'1px solid var(--cp-border)' }}>
                <button className="cp-action" onClick={handleLogout}><LogOut size={16}/> Cerrar sesion</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cp-tabs">
        <div className="cp-tabs-inner">
          {TABS.map(tab => (
            <button key={tab.to} className={`cp-tab ${isActive(tab)?'active':''}`} onClick={() => navigate(tab.to)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
