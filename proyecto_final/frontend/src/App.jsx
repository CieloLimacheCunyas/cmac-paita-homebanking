import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute          from './components/layout/PrivateRoute.jsx'
import Header                from './components/layout/Header.jsx'
import LandingPage           from './pages/LandingPage.jsx'
import LoginPage             from './pages/auth/LoginPage.jsx'
import RegistroPage          from './pages/auth/RegistroPage.jsx'
import HomePage              from './pages/dashboard/HomePage.jsx'
import CuentasAhorroPage     from './pages/cuentas/CuentasAhorroPage.jsx'
import CreditosPage          from './pages/cuentas/CreditosPage.jsx'
import SolicitarCreditoPage  from './pages/creditos/SolicitarCreditoPage.jsx'
import MisSolicitudesPage    from './pages/creditos/MisSolicitudesPage.jsx'
import TransferenciaPage     from './pages/operaciones/TransferenciaPage.jsx'
import BandejaPage           from './pages/core/BandejaPage.jsx'
import MoraPage              from './pages/core/MoraPage.jsx'

function PrivateLayout({ children }) {
  return (
    <PrivateRoute>
      <Header />
      <main className="hb-main">
        <div className="hb-container">{children}</div>
      </main>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Publicas */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/registro"      element={<RegistroPage />} />

      {/* Homebanking — Cliente */}
      <Route path="/inicio"                 element={<PrivateLayout><HomePage /></PrivateLayout>} />
      <Route path="/cuentas/ahorro"         element={<PrivateLayout><CuentasAhorroPage /></PrivateLayout>} />
      <Route path="/cuentas/credito"        element={<PrivateLayout><CreditosPage /></PrivateLayout>} />
      <Route path="/creditos/solicitar"     element={<PrivateLayout><SolicitarCreditoPage /></PrivateLayout>} />
      <Route path="/creditos/mis-solicitudes" element={<PrivateLayout><MisSolicitudesPage /></PrivateLayout>} />
      <Route path="/operaciones/transferencia" element={<PrivateLayout><TransferenciaPage /></PrivateLayout>} />

      {/* Core Bancario — Personal */}
      <Route path="/core/bandeja"    element={<PrivateLayout><BandejaPage /></PrivateLayout>} />
      <Route path="/core/evaluacion" element={<PrivateLayout><BandejaPage /></PrivateLayout>} />
      <Route path="/core/comite"     element={<PrivateLayout><BandejaPage /></PrivateLayout>} />
      <Route path="/core/reportes"   element={<PrivateLayout><BandejaPage /></PrivateLayout>} />
      <Route path="/core/mora"       element={<PrivateLayout><MoraPage /></PrivateLayout>} />

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
