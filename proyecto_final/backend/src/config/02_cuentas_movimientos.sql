-- psql -U postgres -d bd_core_financiero -f 02_cuentas_movimientos.sql
CREATE TABLE cuentas (
  id             SERIAL PRIMARY KEY,
  numero_cuenta  VARCHAR(20) UNIQUE NOT NULL,
  persona_id     INT REFERENCES personas(id) ON DELETE CASCADE,
  tipo           VARCHAR(40) DEFAULT 'Ahorro Corriente',
  saldo          NUMERIC(14,2) DEFAULT 0.00,
  moneda         VARCHAR(3) DEFAULT 'PEN',
  estado         VARCHAR(20) DEFAULT 'activa',
  fecha_apertura DATE DEFAULT CURRENT_DATE,
  creado_en      TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_cuentas_persona ON cuentas(persona_id);

CREATE TABLE movimientos (
  id             SERIAL PRIMARY KEY,
  cuenta_id      INT REFERENCES cuentas(id),
  tipo           VARCHAR(40) NOT NULL,
  monto          NUMERIC(14,2) NOT NULL,
  saldo_despues  NUMERIC(14,2) NOT NULL,
  descripcion    TEXT,
  referencia     VARCHAR(50),
  cuenta_destino INT REFERENCES cuentas(id),
  creado_en      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_movimientos_cuenta ON movimientos(cuenta_id);
CREATE INDEX idx_movimientos_fecha  ON movimientos(creado_en);
