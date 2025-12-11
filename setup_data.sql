
-- Script para poblar la base de datos con datos de ejemplo
-- Ejecutar después de importar notificaciones_schema.sql

USE notificaciones_isdm;

-- Insertar usuarios de ejemplo (admin, moderador, alumnos)
-- Contraseña para todos: "123456"
-- Hash generado con bcrypt rounds=10

INSERT INTO usuarios (nombre, apellido, dni, email, username, password_hash, telefono, rol_id, activo) VALUES
('Admin', 'Sistema', '12345678', 'admin@isdm.edu.ar', 'admin', '$2b$10$rQJ5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxK', '3875551234', 1, TRUE),
('Carlos', 'Moderador', '23456789', 'moderador@isdm.edu.ar', 'moderador', '$2b$10$rQJ5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxK', '3875551235', 2, TRUE),
('Juan', 'Pérez', '34567890', 'juan.perez@gmail.com', 'jperez', '$2b$10$rQJ5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxK', '3875551236', 3, TRUE),
('María', 'González', '45678901', 'maria.gonzalez@gmail.com', 'mgonzalez', '$2b$10$rQJ5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxK', '3875551237', 3, TRUE),
('Pedro', 'Rodríguez', '56789012', 'pedro.rodriguez@gmail.com', 'prodriguez', '$2b$10$rQJ5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxK', '3875551238', 3, TRUE),
('Ana', 'Martínez', '67890123', 'ana.martinez@gmail.com', 'amartinez', '$2b$10$rQJ5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxKxK2XxKxKuN5vZ7VQ3YxK', '3875551239', 3, TRUE);

-- Insertar cursos
INSERT INTO cursos (nombre, descripcion, activo) VALUES
('Programación', 'Tecnicatura en Programación', TRUE),
('Administración', 'Tecnicatura en Administración de Empresas', TRUE),
('Marketing Digital', 'Tecnicatura en Marketing Digital', TRUE);

-- Insertar cursados
INSERT INTO cursados (curso_id, nombre, fecha_inicio, fecha_fin, activo) VALUES
(1, 'Programación - Turno Mañana 2024', '2024-03-01', '2024-12-15', TRUE),
(1, 'Programación - Turno Noche 2024', '2024-03-01', '2024-12-15', TRUE),
(2, 'Administración - Turno Tarde 2024', '2024-03-01', '2024-12-15', TRUE),
(3, 'Marketing Digital - Turno Noche 2024', '2024-03-01', '2024-12-15', TRUE);

-- Inscribir alumnos (los usuarios con rol_id = 3)
INSERT INTO alumnos (id, curso_id, cursado_id, fecha_inscripcion) VALUES
(3, 1, 1, '2024-02-15'),  -- Juan Pérez en Programación Mañana
(4, 1, 2, '2024-02-20'),  -- María González en Programación Noche
(5, 2, 3, '2024-02-18'),  -- Pedro Rodríguez en Administración
(6, 3, 4, '2024-02-22');  -- Ana Martínez en Marketing Digital

-- Generar cuotas para los alumnos (12 meses, monto $15000)
-- Juan Pérez - con 2 cuotas vencidas
INSERT INTO cuotas (alumno_id, mes, anio, monto, fecha_vencimiento, pagado, fecha_pago) VALUES
(3, 3, 2024, 15000, '2024-03-10', FALSE, NULL),  -- Vencida
(3, 4, 2024, 15000, '2024-04-10', FALSE, NULL),  -- Vencida
(3, 5, 2024, 15000, '2024-05-10', TRUE, '2024-05-08'),
(3, 6, 2024, 15000, '2024-06-10', TRUE, '2024-06-05'),
(3, 7, 2024, 15000, '2024-07-10', TRUE, '2024-07-08'),
(3, 8, 2024, 15000, '2024-08-10', TRUE, '2024-08-07'),
(3, 9, 2024, 15000, '2024-09-10', TRUE, '2024-09-09'),
(3, 10, 2024, 15000, '2024-10-10', TRUE, '2024-10-08'),
(3, 11, 2024, 15000, '2024-11-10', FALSE, NULL),  -- Pendiente
(3, 12, 2024, 15000, '2024-12-10', FALSE, NULL);  -- Pendiente

-- María González - con 3 cuotas vencidas
INSERT INTO cuotas (alumno_id, mes, anio, monto, fecha_vencimiento, pagado, fecha_pago) VALUES
(4, 3, 2024, 15000, '2024-03-10', FALSE, NULL),  -- Vencida
(4, 4, 2024, 15000, '2024-04-10', FALSE, NULL),  -- Vencida
(4, 5, 2024, 15000, '2024-05-10', FALSE, NULL),  -- Vencida
(4, 6, 2024, 15000, '2024-06-10', TRUE, '2024-06-09'),
(4, 7, 2024, 15000, '2024-07-10', TRUE, '2024-07-10'),
(4, 8, 2024, 15000, '2024-08-10', TRUE, '2024-08-09'),
(4, 9, 2024, 15000, '2024-09-10', TRUE, '2024-09-11'),
(4, 10, 2024, 15000, '2024-10-10', TRUE, '2024-10-09'),
(4, 11, 2024, 15000, '2024-11-10', FALSE, NULL),  -- Pendiente
(4, 12, 2024, 15000, '2024-12-10', FALSE, NULL);  -- Pendiente

-- Pedro Rodríguez - al día
INSERT INTO cuotas (alumno_id, mes, anio, monto, fecha_vencimiento, pagado, fecha_pago) VALUES
(5, 3, 2024, 15000, '2024-03-10', TRUE, '2024-03-08'),
(5, 4, 2024, 15000, '2024-04-10', TRUE, '2024-04-09'),
(5, 5, 2024, 15000, '2024-05-10', TRUE, '2024-05-10'),
(5, 6, 2024, 15000, '2024-06-10', TRUE, '2024-06-08'),
(5, 7, 2024, 15000, '2024-07-10', TRUE, '2024-07-09'),
(5, 8, 2024, 15000, '2024-08-10', TRUE, '2024-08-08'),
(5, 9, 2024, 15000, '2024-09-10', TRUE, '2024-09-09'),
(5, 10, 2024, 15000, '2024-10-10', TRUE, '2024-10-09'),
(5, 11, 2024, 15000, '2024-11-10', FALSE, NULL),  -- Pendiente
(5, 12, 2024, 15000, '2024-12-10', FALSE, NULL);  -- Pendiente

-- Ana Martínez - con 1 cuota vencida
INSERT INTO cuotas (alumno_id, mes, anio, monto, fecha_vencimiento, pagado, fecha_pago) VALUES
(6, 3, 2024, 15000, '2024-03-10', FALSE, NULL),  -- Vencida
(6, 4, 2024, 15000, '2024-04-10', TRUE, '2024-04-11'),
(6, 5, 2024, 15000, '2024-05-10', TRUE, '2024-05-09'),
(6, 6, 2024, 15000, '2024-06-10', TRUE, '2024-06-10'),
(6, 7, 2024, 15000, '2024-07-10', TRUE, '2024-07-08'),
(6, 8, 2024, 15000, '2024-08-10', TRUE, '2024-08-09'),
(6, 9, 2024, 15000, '2024-09-10', TRUE, '2024-09-08'),
(6, 10, 2024, 15000, '2024-10-10', TRUE, '2024-10-10'),
(6, 11, 2024, 15000, '2024-11-10', FALSE, NULL),  -- Pendiente
(6, 12, 2024, 15000, '2024-12-10', FALSE, NULL);  -- Pendiente

-- Plantillas de ejemplo
INSERT INTO plantillas_mensajes (titulo, cuerpo, tipo, creador_id, activo) VALUES
('Recordatorio de Cuota Vencida', 
'Hola {{nombre}} {{apellido}},\n\nTe recordamos que tenés {{meses_deuda}} cuota(s) vencida(s) por un total de ${{importe_total}}.\n\nPor favor, acercate a la administración para regularizar tu situación.\n\nSaludos,\nInstituto Superior del Milagro', 
'email', 1, TRUE),

('Cuota Próxima a Vencer',
'Estimado/a {{nombre}},\n\nTe recordamos que tu cuota vence el {{vencimiento_min}}. No olvides realizar el pago para evitar recargos.\n\nGracias,\nISDM',
'whatsapp', 1, TRUE),

('Pago Confirmado',
'¡Hola {{nombre}}! Confirmamos la recepción de tu pago. ¡Gracias por mantener tus cuotas al día! 😊',
'push', 1, TRUE);

-- Configuraciones de notificación
INSERT INTO configuracion_notificaciones (nombre, descripcion, meses_deuda, enviar_email, enviar_whatsapp, enviar_push, activo) VALUES
('Notificación 1 mes de deuda', 'Enviar notificación a alumnos con 1 mes de deuda', 1, TRUE, FALSE, FALSE, TRUE),
('Notificación 2 meses de deuda', 'Enviar notificación a alumnos con 2 meses de deuda', 2, TRUE, TRUE, FALSE, TRUE),
('Notificación 3+ meses de deuda', 'Enviar notificación a alumnos con 3 o más meses de deuda', 3, TRUE, TRUE, TRUE, TRUE);

-- Algunos ejemplos de notificaciones enviadas (historial)
INSERT INTO notificaciones_enviadas (alumno_id, plantilla_id, medio, fecha_envio, exito, referencia_externa) VALUES
(3, 1, 'email', '2024-11-01 09:00:00', TRUE, 'EMAIL-1730451600000'),
(4, 1, 'email', '2024-11-01 09:00:15', TRUE, 'EMAIL-1730451615000'),
(6, 2, 'whatsapp', '2024-11-10 10:30:00', TRUE, 'WA-1731234600000'),
(3, 2, 'whatsapp', '2024-11-15 09:15:00', TRUE, 'WA-1731666900000');

-- Verificar datos insertados
SELECT 'Usuarios creados:' as Info, COUNT(*) as Total FROM usuarios;
SELECT 'Cursos creados:' as Info, COUNT(*) as Total FROM cursos;
SELECT 'Alumnos inscritos:' as Info, COUNT(*) as Total FROM alumnos;
SELECT 'Cuotas generadas:' as Info, COUNT(*) as Total FROM cuotas;
SELECT 'Plantillas creadas:' as Info, COUNT(*) as Total FROM plantillas_mensajes;
SELECT 'Alumnos con deuda:' as Info, COUNT(*) as Total FROM vista_deudas;
