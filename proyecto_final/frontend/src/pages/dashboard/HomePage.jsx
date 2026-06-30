import { useNavigate } from 'react-router-dom'
import { Wallet, CreditCard, Send, Receipt, FilePlus2, PiggyBank, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useHBAuth } from '../../hooks/useHBAuth.js'
import { useCuentas } from '../../hooks/useCuentas.js'
import { formatMoney } from '../../utils/format.js'

export default function HomePage() {
  const { user }   = useHBAuth()
  const navigate   = useNavigate()
  const { cuentas, loading } = useCuentas()

  const primerNombre = (n) => n ? n.split(' ')[0] : 'Cliente'
  const totalSaldo   = cuentas.reduce((s, c) => s + parseFloat(c.saldo), 0)

  const ACCIONES = [
    { icon: Send,      label: 'Transferencias propias', to: '/operaciones/transferencia' },
    { icon: Receipt,   label: 'Pago de credito',        to: '/operaciones/pago-credito'  },
    { icon: FilePlus2, label: 'Solicitar prestamo',     to: '/creditos/solicitar'         },
  ]

  return (
    <div className="cp-page">
      <div className="cp-page-main">
        <div className="cp-hello">
          <h1>Hola {primerNombre(user?.nombres)}, bienvenido</h1>
          <p>Esta es la posicion global de tus productos en CMAC Paita.</p>
        </div>

        <div className="cp-kpis">
          <div className="cp-kpi">
            <span className="cp-kpi-ico" style={{ background:'#E8F1F9', color:'var(--cp-azul)' }}>
              <PiggyBank size={22}/>
            </span>
            <div>
              <span className="cp-kpi-label"><TrendingUp size={13}/> Total en ahorros</span>
              <span className="cp-kpi-val">{loading ? '...' : formatMoney(totalSaldo)}</span>
              <small>{cuentas.length} cuenta(s)</small>
            </div>
          </div>
          <div className="cp-kpi">
            <span className="cp-kpi-ico" style={{ background:'#FEF3E8', color:'var(--cp-naranja)' }}>
              <CreditCard size={22}/>
            </span>
            <div>
              <span className="cp-kpi-label"><TrendingDown size={13}/> Deuda total creditos</span>
              <span className="cp-kpi-val">{formatMoney(0)}</span>
              <small>0 credito(s)</small>
            </div>
          </div>
        </div>

        <div className="cp-card">
          <div className="cp-card-head">
            <h3><Wallet size={18}/> Cuentas de Ahorro</h3>
            <button className="cp-link" onClick={() => navigate('/cuentas/ahorro')}>Ver todas <ChevronRight size={14}/></button>
          </div>
          <div className="cp-card-body" style={{ padding:0 }}>
            {loading ? (
              <div style={{ padding:'1rem' }}><span style={{ color:'var(--cp-muted)', fontSize:14 }}>Cargando...</span></div>
            ) : cuentas.length === 0 ? (
              <p className="cp-empty">No tienes cuentas de ahorro.</p>
            ) : (
              <ul className="cp-prodlist">
                {cuentas.map(c => (
                  <li key={c.id} onClick={() => navigate('/cuentas/ahorro')}>
                    <div className="cp-prod-info">
                      <strong>{c.numero_cuenta}</strong>
                      <small>{c.tipo}</small>
                    </div>
                    <div className="cp-prod-amt">
                      <span style={{ fontWeight:700, color:'var(--cp-azul)' }}>{formatMoney(c.saldo)}</span>
                      <ChevronRight size={16}/>
                    </div>
                  </li>
                ))}
                <li className="cp-prodlist-total">
                  <span>Saldo disponible total</span>
                  <span className="cp-money-strong">{formatMoney(totalSaldo)}</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="cp-card">
          <div className="cp-card-head">
            <h3><CreditCard size={18}/> Mis Prestamos</h3>
            <button className="cp-link" onClick={() => navigate('/cuentas/credito')}>Ver todos <ChevronRight size={14}/></button>
          </div>
          <div className="cp-card-body">
            <p className="cp-empty">Modulo en construccion — proximamente disponible.</p>
          </div>
        </div>
      </div>

      <div className="cp-page-aside">
        <div className="cp-actions">
          <p className="cp-actions-title">Operaciones frecuentes</p>
          <div className="cp-actions-list">
            {ACCIONES.map(a => {
              const Icon = a.icon
              return (
                <button key={a.to} className="cp-action" onClick={() => navigate(a.to)}>
                  <span className="cp-action-ico"><Icon size={18}/></span>
                  {a.label}
                  <ChevronRight size={16} style={{ marginLeft:'auto', color:'var(--cp-muted)' }}/>
                </button>
              )
            })}
          </div>
        </div>
        <div className="cp-card" style={{ marginTop:16 }}>
          <div className="cp-card-body">
            <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--cp-muted)' }}>Usuario</span>
                <span style={{ fontWeight:600 }}>{user?.username}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--cp-muted)' }}>Rol</span>
                <span style={{ fontWeight:600, textTransform:'capitalize' }}>{user?.rol}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--cp-muted)' }}>Email</span>
                <span style={{ fontWeight:600, fontSize:12 }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
