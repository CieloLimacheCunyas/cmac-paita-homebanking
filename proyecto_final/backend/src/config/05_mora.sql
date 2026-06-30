
-- psql -U postgres -d bd_core_financiero -f 05_mora.sql

CREATE TABLE gestiones_cobranza (
  id           SERIAL PRIMARY KEY,
  credito_id   INT REFERENCES creditos(id),
  usuario_id   INT REFERENCES usuarios(id),
  tipo         VARCHAR(30) NOT NULL,
  descripcion  TEXT,
  resultado    VARCHAR(50),
  creado_en    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gestiones_credito ON gestiones_cobranza(credito_id);
