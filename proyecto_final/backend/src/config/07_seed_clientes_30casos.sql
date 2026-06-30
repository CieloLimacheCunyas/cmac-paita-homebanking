-- ============================================================
-- SCRIPT 07 — 17 clientes para los 30 casos de práctica
-- psql -U postgres -h 127.0.0.1 -d bd_core_financiero -f 07_seed_clientes_30casos.sql
-- Password para todos: Paita2024!
-- Hash bcrypt de 'Paita2024!' (10 rounds)
-- ============================================================

DO $$
DECLARE
  hash TEXT := '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  rol_cliente INT;
  p_id INT;
  u_id INT;
  nro TEXT;
BEGIN
  SELECT id INTO rol_cliente FROM roles WHERE nombre = 'cliente';

  -- 1. Castor Pérez
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000001','Castor','Perez Garcia') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110001','castor.perez@cajapaita.pe',hash);
  nro := '10' || LPAD('11000001',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,2000.00);

  -- 2. Eneida Mamani
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000002','Eneida','Mamani Quispe') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110002','eneida.mamani@cajapaita.pe',hash);
  nro := '10' || LPAD('11000002',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,5000.00);

  -- 3. Ovidio Torres
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000003','Ovidio','Torres Ramirez') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110003','ovidio.torres@cajapaita.pe',hash);
  nro := '10' || LPAD('11000003',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,8000.00);

  -- 4. Dante Flores
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000004','Dante','Flores Vega') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110004','dante.flores@cajapaita.pe',hash);
  nro := '10' || LPAD('11000004',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,10000.00);

  -- 5. Laura Mendoza
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000005','Laura','Mendoza Castro') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110005','laura.mendoza@cajapaita.pe',hash);
  nro := '10' || LPAD('11000005',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,12000.00);

  -- 6. Boccaccio Vargas
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000006','Boccaccio','Vargas Leal') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110006','boccaccio.vargas@cajapaita.pe',hash);
  nro := '10' || LPAD('11000006',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,15000.00);

  -- 7. Orlando Ríos
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000007','Orlando','Rios Paredes') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110007','orlando.rios@cajapaita.pe',hash);
  nro := '10' || LPAD('11000007',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,18000.00);

  -- 8. Gerusalemme Huanca
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000008','Gerusalemme','Huanca Ticona') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110008','gerusalemme.huanca@cajapaita.pe',hash);
  nro := '10' || LPAD('11000008',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,20000.00);

  -- 9. Pedro Calderón
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000009','Pedro','Calderon Suarez') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110009','pedro.calderon@cajapaita.pe',hash);
  nro := '10' || LPAD('11000009',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,25000.00);

  -- 10. Félix Chávez
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000010','Felix','Chavez Morales') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110010','felix.chavez@cajapaita.pe',hash);
  nro := '10' || LPAD('11000010',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,30000.00);

  -- 11. Hildegarda Huanca
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000011','Hildegarda','Huanca Flores') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110011','hildegarda.huanca@cajapaita.pe',hash);
  nro := '10' || LPAD('11000011',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,3000.00);

  -- 12. Stendhal Aguilar
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000012','Stendhal','Aguilar Rivas') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110012','stendhal.aguilar@cajapaita.pe',hash);
  nro := '10' || LPAD('11000012',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,6000.00);

  -- 13. Kipling Soto
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000013','Kipling','Soto Mendez') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110013','kipling.soto@cajapaita.pe',hash);
  nro := '10' || LPAD('11000013',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,9000.00);

  -- 14. Erinná Espinoza
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000014','Erinna','Espinoza Lara') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110014','erinna.espinoza@cajapaita.pe',hash);
  nro := '10' || LPAD('11000014',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,10000.00);

  -- 15. Annie Espinoza
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000015','Annie','Espinoza Lara') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110015','annie.espinoza@cajapaita.pe',hash);
  nro := '10' || LPAD('11000015',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,12000.00);

  -- 16. Homero Quispe
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000016','Homero','Quispe Condori') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110016','homero.quispe@cajapaita.pe',hash);
  nro := '10' || LPAD('11000016',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,14000.00);

  -- 17. Virgilio Mamani
  INSERT INTO personas (dni,nombres,apellidos) VALUES ('11000017','Virgilio','Mamani Coila') RETURNING id INTO p_id;
  INSERT INTO usuarios (persona_id,rol_id,username,email,password_hash) VALUES (p_id,rol_cliente,'cli110017','virgilio.mamani@cajapaita.pe',hash);
  nro := '10' || LPAD('11000017',14,'0');
  INSERT INTO cuentas (numero_cuenta,persona_id,saldo) VALUES (nro,p_id,16000.00);

  RAISE NOTICE '✅ 17 clientes creados exitosamente';
END $$;
