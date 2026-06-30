# CMAC Paita — Home Banking + Core Bancario
**Stack:** React + Vite (frontend) · Node.js + Express (backend) · PostgreSQL

---

## ⚡ Inicio rápido — sigue este orden exacto

### 1. Crear la base de datos
```bash
psql -U postgres -f backend/src/config/00_crear_bd.sql
psql -U postgres -d bd_core_financiero -f backend/src/config/01_usuarios_roles.sql
psql -U postgres -d bd_core_financiero -f backend/src/config/02_cuentas_movimientos.sql
```

### 2. Configurar el backend
```bash
cd backend
cp .env.example .env
# Editar .env → poner tu PASSWORD de PostgreSQL
npm install
node src/config/seed.js   # crea usuarios de prueba
npm run dev               # inicia en http://localhost:3001
```

### 3. Configurar el frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # inicia en http://localhost:5173
```

---

## 👤 Usuarios de prueba (password: Paita2024!)

| Usuario      | Email                    | Rol      |
|-------------|--------------------------|----------|
| cli000001   | cliente@cajapaita.pe     | cliente  |
| asesor01    | asesor@cajapaita.pe      | asesor   |
| admin01     | admin@cajapaita.pe       | admin    |
| riesgos01   | riesgos@cajapaita.pe     | riesgos  |
| comite01    | comite@cajapaita.pe      | comite   |
| gerencia01  | gerencia@cajapaita.pe    | gerencia |

---

## 🏗 Arquitectura
```
backend/
├── server.js                    ← Punto de entrada Express
├── src/
│   ├── config/
│   │   ├── 00_crear_bd.sql      ← Script BD
│   │   ├── 01_usuarios_roles.sql
│   │   ├── 02_cuentas_movimientos.sql
│   │   ├── db.js                ← Pool PostgreSQL
│   │   └── seed.js              ← Datos iniciales
│   ├── middlewares/
│   │   └── auth.middleware.js   ← JWT + RBAC
│   ├── routes/
│   │   └── auth.routes.js
│   ├── controllers/
│   │   └── auth.controller.js
│   └── services/
│       ├── auth.service.js      ← Lógica de negocio
│       └── auth.repository.js   ← SQL queries

frontend/
├── src/
│   ├── App.jsx                  ← Router principal
│   ├── index.css                ← Estilos CMAC Paita
│   ├── context/
│   │   └── HBAuthContext.jsx    ← Estado de autenticación
│   ├── hooks/
│   │   └── useHBAuth.js
│   ├── services/
│   │   ├── cp_api.js            ← Cliente axios
│   │   └── authService.js
│   ├── utils/format.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── PrivateRoute.jsx
│   │   └── ui/
│   │       ├── Alert.jsx
│   │       └── Loader.jsx
│   └── pages/
│       ├── LandingPage.jsx
│       ├── auth/
│       │   ├── LoginPage.jsx
│       │   └── RegistroPage.jsx
│       └── dashboard/
│           └── HomePage.jsx
```

---

## 📋 Rúbrica — Plan de implementación

| Criterio | Estado | Prioridad |
|----------|--------|-----------|
| 1. Integración Core ↔ HB | 🔄 En progreso | Alta |
| 2. Reglas de negocio crédito | 📅 Pendiente | Alta |
| 3. RBAC + JWT | ✅ Implementado | - |
| 4. Recuperaciones / Mora | 📅 Pendiente | Media |
| 5. Calidad + Documentación | 🔄 En progreso | Alta |
