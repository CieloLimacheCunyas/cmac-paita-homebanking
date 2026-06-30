-- psql -U postgres -d bd_core_financiero -f 03_seed_movimientos.sql
-- Agrega saldo y movimientos de prueba al cliente cli000001

-- Actualizar saldo de la cuenta del cliente
UPDATE cuentas SET saldo = 5250.80 WHERE persona_id = (
  SELECT id FROM personas WHERE dni = '12345678'
);

-- Insertar movimientos de prueba
INSERT INTO movimientos (cuenta_id, tipo, monto, saldo_despues, descripcion, referencia)
SELECT c.id, 'deposito', 5000.00, 5000.00, 'Deposito inicial de apertura', 'DEP-001'
FROM cuentas c JOIN personas p ON p.id = c.persona_id WHERE p.dni = '12345678';

INSERT INTO movimientos (cuenta_id, tipo, monto, saldo_despues, descripcion, referencia)
SELECT c.id, 'deposito', 500.00, 5500.00, 'Deposito en ventanilla', 'DEP-002'
FROM cuentas c JOIN personas p ON p.id = c.persona_id WHERE p.dni = '12345678';

INSERT INTO movimientos (cuenta_id, tipo, monto, saldo_despues, descripcion, referencia)
SELECT c.id, 'retiro', 249.20, 5250.80, 'Retiro cajero automatico', 'RET-001'
FROM cuentas c JOIN personas p ON p.id = c.persona_id WHERE p.dni = '12345678';
