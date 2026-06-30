// Ejecutar: node src/config/seed.js
const { Pool } = require('pg')
const bcrypt   = require('bcrypt')
require('dotenv').config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const PASS = 'Paita2024!'

const USUARIOS = [
  { dni:'12345678', nombres:'Carlos',   apellidos:'Rios Perez',     email:'cliente@cajapaita.pe',  username:'cli000001', rol:'cliente'  },
  { dni:'23456789', nombres:'Maria',    apellidos:'Lopez Torres',   email:'asesor@cajapaita.pe',   username:'asesor01',  rol:'asesor'   },
  { dni:'34567890', nombres:'Roberto',  apellidos:'Garcia Mendoza', email:'admin@cajapaita.pe',    username:'admin01',   rol:'admin'    },
  { dni:'45678901', nombres:'Sandra',   apellidos:'Huanca Cruz',    email:'riesgos@cajapaita.pe',  username:'riesgos01', rol:'riesgos'  },
  { dni:'56789012', nombres:'Jorge',    apellidos:'Flores Vega',    email:'comite@cajapaita.pe',   username:'comite01',  rol:'comite'   },
  { dni:'67890123', nombres:'Patricia', apellidos:'Quispe Mamani',  email:'gerencia@cajapaita.pe', username:'gerencia01',rol:'gerencia' },
]

async function seed() {
  const hash = await bcrypt.hash(PASS, 10)
  for (const u of USUARIOS) {
    const { rows: [p] } = await pool.query(
      'INSERT INTO personas (dni,nombres,apellidos) VALUES ($1,$2,$3) ON CONFLICT (dni) DO UPDATE SET nombres=EXCLUDED.nombres RETURNING id',
      [u.dni, u.nombres, u.apellidos]
    )
    const { rows: [r] } = await pool.query('SELECT id FROM roles WHERE nombre=$1',[u.rol])
    await pool.query(
      'INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING',
      [p.id, r.id, u.username, u.email, hash]
    )
    if (u.rol === 'cliente') {
      await pool.query(
        'INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES ($1,$2,$3) ON CONFLICT (numero_cuenta) DO NOTHING',
        ['10' + u.dni.padStart(14,'0'), p.id, 5250.80]
      )
    }
    console.log(`OK ${u.rol.padEnd(8)} | ${u.username} | ${u.email}`)
  }
  console.log('\nPassword para todos: ' + PASS)
  await pool.end()
}
seed().catch(e => { console.error(e); process.exit(1) })
