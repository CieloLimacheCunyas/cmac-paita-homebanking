-- EJECUTAR como superusuario: psql -U postgres -f 00_crear_bd.sql
DROP DATABASE IF EXISTS bd_core_financiero;
CREATE DATABASE bd_core_financiero WITH ENCODING='UTF8' TEMPLATE=template0;
\connect bd_core_financiero
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
