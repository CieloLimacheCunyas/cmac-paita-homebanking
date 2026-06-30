-- psql -U postgres -d bd_core_financiero -f 01_usuarios_roles.sql
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en   TIMESTAMP DEFAULT NOW()
);
INSERT INTO roles (nombre, descripcion) VALUES
  ('cliente',  'Cliente Homebanking'),
  ('asesor',   'Asesor de Negocios'),
  ('admin',    'Administrador'),
  ('riesgos',  'Analista de Riesgos'),
  ('comite',   'Comite de Creditos'),
  ('gerencia', 'Gerencia');

CREATE TABLE personas (
  id             SERIAL PRIMARY KEY,
  dni            VARCHAR(8)   UNIQUE NOT NULL,
  nombres        VARCHAR(100) NOT NULL,
  apellidos      VARCHAR(100) NOT NULL,
  telefono       VARCHAR(15),
  direccion      TEXT,
  fecha_nac      DATE,
  creado_en      TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
  id                SERIAL PRIMARY KEY,
  persona_id        INT  REFERENCES personas(id) ON DELETE CASCADE,
  rol_id            INT  REFERENCES roles(id) ON DELETE SET NULL,
  username          VARCHAR(50)  UNIQUE NOT NULL,
  email             VARCHAR(150) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  activo            BOOLEAN DEFAULT TRUE,
  bloqueado         BOOLEAN DEFAULT FALSE,
  intentos_fallidos INT DEFAULT 0,
  ultimo_acceso     TIMESTAMP,
  creado_en         TIMESTAMP DEFAULT NOW(),
  actualizado_en    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email    ON usuarios(email);

CREATE TABLE refresh_tokens (
  id         SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expira_en  TIMESTAMP NOT NULL,
  revocado   BOOLEAN DEFAULT FALSE,
  creado_en  TIMESTAMP DEFAULT NOW()
);
