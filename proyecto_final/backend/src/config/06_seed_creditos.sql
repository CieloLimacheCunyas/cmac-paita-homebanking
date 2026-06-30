
-- psql -U postgres -d bd_core_financiero -f 06_seed_creditos.sql

-- Solicitud aprobada y desembolsada para el cliente
INSERT INTO solicitudes_credito (persona_id, producto_id, monto, plazo_meses, tea, con_seguro, cuota_mensual, proposito, estado, scoring, rds, fecha_desembolso)
SELECT p.id, 1, 5000, 12, 0.4392, false, 504.73, 'Capital de trabajo para negocio', 'desembolsado', 720, 0.35, NOW()
FROM personas p WHERE p.dni = '12345678';

-- Credito desembolsado
INSERT INTO creditos (solicitud_id, persona_id, cuenta_id, numero_credito, monto_desembolso, saldo_pendiente, cuota_mensual, tea, plazo_meses, fecha_desembolso, fecha_vencimiento, estado)
SELECT s.id, s.persona_id, c.id, 'CRED-001-2024', 5000, 4500.50, 504.73, 0.4392, 12,
       CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '10 months', 'vigente'
FROM solicitudes_credito s
JOIN cuentas c ON c.persona_id = s.persona_id
WHERE s.persona_id = (SELECT id FROM personas WHERE dni='12345678')
LIMIT 1;

-- Cuotas del credito
INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado, fecha_pago, monto_pagado)
SELECT cr.id, 1, CURRENT_DATE - INTERVAL '2 months', 504.73, 350.32, 154.41, 4649.68, 'pagada', CURRENT_DATE - INTERVAL '2 months', 504.73
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado, fecha_pago, monto_pagado)
SELECT cr.id, 2, CURRENT_DATE - INTERVAL '1 month', 504.73, 361.12, 143.61, 4288.56, 'pagada', CURRENT_DATE - INTERVAL '1 month', 504.73
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 3, CURRENT_DATE + INTERVAL '1 month', 504.73, 372.24, 132.49, 3916.32, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 4, CURRENT_DATE + INTERVAL '2 months', 504.73, 383.69, 121.04, 3532.63, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 5, CURRENT_DATE + INTERVAL '3 months', 504.73, 395.49, 109.24, 3137.14, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 6, CURRENT_DATE + INTERVAL '4 months', 504.73, 407.65, 97.08, 2729.49, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 7, CURRENT_DATE + INTERVAL '5 months', 504.73, 420.17, 84.56, 2309.32, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 8, CURRENT_DATE + INTERVAL '6 months', 504.73, 433.08, 71.65, 1876.24, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 9, CURRENT_DATE + INTERVAL '7 months', 504.73, 446.37, 58.36, 1429.87, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 10, CURRENT_DATE + INTERVAL '8 months', 504.73, 460.07, 44.66, 969.80, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 11, CURRENT_DATE + INTERVAL '9 months', 504.73, 474.18, 30.55, 495.62, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';

INSERT INTO cuotas_credito (credito_id, nro_cuota, fecha_venc, cuota, capital, interes, saldo, estado)
SELECT cr.id, 12, CURRENT_DATE + INTERVAL '10 months', 504.73, 495.62, 9.11, 0.00, 'pendiente'
FROM creditos cr WHERE cr.numero_credito = 'CRED-001-2024';
