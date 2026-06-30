
-- psql -U postgres -d bd_core_financiero -f 04_creditos.sql

CREATE TABLE productos_credito (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  tea_sin_seg NUMERIC(6,4) NOT NULL,
  tea_con_seg NUMERIC(6,4) NOT NULL,
  monto_min   NUMERIC(14,2) DEFAULT 500,
  monto_max   NUMERIC(14,2) DEFAULT 30000,
  plazo_min   INT DEFAULT 6,
  plazo_max   INT DEFAULT 36,
  activo      BOOLEAN DEFAULT TRUE
);

INSERT INTO productos_credito (nombre, tea_sin_seg, tea_con_seg, monto_min, monto_max) VALUES
  ('Credito Empresarial Micro', 0.4392, 0.4092, 500, 30000);

CREATE TABLE solicitudes_credito (
  id               SERIAL PRIMARY KEY,
  persona_id       INT REFERENCES personas(id),
  producto_id      INT REFERENCES productos_credito(id),
  monto            NUMERIC(14,2) NOT NULL,
  plazo_meses      INT NOT NULL,
  tea              NUMERIC(6,4) NOT NULL,
  con_seguro       BOOLEAN DEFAULT FALSE,
  cuota_mensual    NUMERIC(14,2),
  proposito        TEXT,
  estado           VARCHAR(30) DEFAULT 'enviado',
  asesor_id        INT REFERENCES usuarios(id),
  admin_id         INT REFERENCES usuarios(id),
  riesgos_id       INT REFERENCES usuarios(id),
  comite_id        INT REFERENCES usuarios(id),
  obs_asesor       TEXT,
  obs_admin        TEXT,
  obs_riesgos      TEXT,
  obs_comite       TEXT,
  scoring          INT,
  rds              NUMERIC(6,4),
  fecha_solicitud  TIMESTAMP DEFAULT NOW(),
  fecha_desembolso TIMESTAMP,
  creado_en        TIMESTAMP DEFAULT NOW(),
  actualizado_en   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sol_persona  ON solicitudes_credito(persona_id);
CREATE INDEX idx_sol_estado   ON solicitudes_credito(estado);
CREATE INDEX idx_sol_asesor   ON solicitudes_credito(asesor_id);

CREATE TABLE creditos (
  id               SERIAL PRIMARY KEY,
  solicitud_id     INT REFERENCES solicitudes_credito(id),
  persona_id       INT REFERENCES personas(id),
  cuenta_id        INT REFERENCES cuentas(id),
  numero_credito   VARCHAR(20) UNIQUE NOT NULL,
  monto_desembolso NUMERIC(14,2) NOT NULL,
  saldo_pendiente  NUMERIC(14,2) NOT NULL,
  cuota_mensual    NUMERIC(14,2) NOT NULL,
  tea              NUMERIC(6,4) NOT NULL,
  plazo_meses      INT NOT NULL,
  fecha_desembolso DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado           VARCHAR(20) DEFAULT 'vigente',
  dias_atraso      INT DEFAULT 0,
  creado_en        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cuotas_credito (
  id             SERIAL PRIMARY KEY,
  credito_id     INT REFERENCES creditos(id),
  nro_cuota      INT NOT NULL,
  fecha_venc     DATE NOT NULL,
  cuota          NUMERIC(14,2) NOT NULL,
  capital        NUMERIC(14,2) NOT NULL,
  interes        NUMERIC(14,2) NOT NULL,
  saldo          NUMERIC(14,2) NOT NULL,
  estado         VARCHAR(20) DEFAULT 'pendiente',
  fecha_pago     DATE,
  monto_pagado   NUMERIC(14,2)
);

CREATE INDEX idx_cuotas_credito ON cuotas_credito(credito_id);
