import { useNavigate } from 'react-router-dom'
import { PiggyBank, CreditCard, Send, BadgePercent, Briefcase, Wallet, Lock, ArrowRight } from 'lucide-react'

const PRODUCTOS = [
  { icon: PiggyBank,    color:'#005A9C', titulo:'Cuenta de Ahorros',     desc:'Maneja tu dinero sin costo de mantenimiento y gana intereses todos los dias.' },
  { icon: BadgePercent, color:'#F47920', titulo:'Credito Empresarial',   desc:'Financia tu microempresa con tasas competitivas y cuotas fijas a tu medida.' },
  { icon: Send,         color:'#005A9C', titulo:'Transferencias',        desc:'Mueve tu dinero entre tus cuentas al instante, las 24 horas del dia.' },
  { icon: CreditCard,   color:'#F47920', titulo:'Pago de Servicios',     desc:'Paga tus servicios y cuotas de credito sin salir de casa.' },
  { icon: Briefcase,    color:'#005A9C', titulo:'Credito Microempresa',  desc:'Impulsa tu negocio con financiamiento agil pensado para emprendedores.' },
  { icon: Wallet,       color:'#F47920', titulo:'Cuenta Sueldo',         desc:'Recibe tu sueldo y accede a beneficios exclusivos para trabajadores.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="lp-page">
      <div className="cp-franja-top" />

      {/* Header publico */}
      <div style={{ background:'var(--cp-azul)', padding:'1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, color:'#fff', fontWeight:800, fontSize:18 }}>
          <img src="/logo.png" alt="CMAC Paita" style={{ height:36, objectFit:"contain" }} />
          CMAC Paita
        </div>
        <button className="cp-btn" onClick={() => navigate('/login')} style={{ padding:'8px 18px', fontSize:14 }}>
          <Lock size={16} /> Ingresar
        </button>
      </div>

      {/* Hero */}
      <section className="lp-hero">
        <h1>Tu caja municipal digital,<br />al servicio del norte del Peru</h1>
        <p>Abre tu cuenta, solicita creditos y transfiere tu dinero en minutos. Todo desde tu Banca por Internet CMAC Paita.</p>
        <div className="lp-hero-actions">
          <button className="lp-btn-main" onClick={() => navigate('/login')}><Lock size={18}/> Ingresar a mi banca</button>
          <button className="lp-btn-outline" onClick={() => navigate('/registro')}>Abrir cuenta gratis <ArrowRight size={18}/></button>
        </div>
      </section>

      {/* Accesos rapidos */}
      <div className="lp-quickbar">
        {[
          ['Abrir cuenta',     Wallet],
          ['Solicitar credito',BadgePercent],
          ['Transferir',       Send],
          ['Pagar cuota',      CreditCard],
        ].map(([label, Icon]) => (
          <button key={label} className="lp-quick" onClick={() => navigate('/login')}>
            <Icon size={20} /> {label}
          </button>
        ))}
      </div>

      {/* Productos */}
      <section className="lp-section">
        <div className="lp-section-head">
          <h2>Nuestros productos</h2>
          <p>Soluciones financieras simples y accesibles para cada momento de tu vida.</p>
        </div>
        <div className="lp-products">
          {PRODUCTOS.map(p => {
            const Icon = p.icon
            return (
              <article className="lp-product" key={p.titulo}>
                <div className="lp-product-ico" style={{ background:`${p.color}1a`, color:p.color }}><Icon size={26}/></div>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
                <button className="lp-product-link" onClick={() => navigate('/login')}>
                  Conoce mas <ArrowRight size={15}/>
                </button>
              </article>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <div style={{ background:'var(--cp-azul)', color:'#fff', textAlign:'center', padding:'2rem', fontSize:13, opacity:.9 }}>
        © 2024 CMAC Paita — Caja Municipal de Ahorro y Credito de Paita · Supervisada por la SBS
      </div>
    </div>
  )
}
