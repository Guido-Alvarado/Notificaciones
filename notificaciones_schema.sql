SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS notificaciones_enviadas;
DROP TABLE IF EXISTS tokens_push;
DROP TABLE IF EXISTS plantillas_mensajes;
DROP TABLE IF EXISTS configuracion_notificaciones;
DROP TABLE IF EXISTS cuotas;
DROP TABLE IF EXISTS alumnos;
DROP TABLE IF EXISTS cursados;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS=1;

----------------------------------------------------------------------
-- ROLES
----------------------------------------------------------------------

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre) VALUES 
('admin'), 
('moderador'), 
('alumno');

----------------------------------------------------------------------
-- USUARIOS (admins, moderadores, alumnos)
----------------------------------------------------------------------

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,

  dni VARCHAR(20) NOT NULL UNIQUE,

  email VARCHAR(120) NOT NULL UNIQUE,
  username VARCHAR(80) UNIQUE,

  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30),

  rol_id INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (rol_id) REFERENCES roles(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- CURSOS (Ej: “Programación”, “Marketing”, etc.)
----------------------------------------------------------------------

CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE
);

----------------------------------------------------------------------
-- CURSADOS (Ej: “Programación – Turno mañana – 2024”)
----------------------------------------------------------------------

CREATE TABLE cursados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (curso_id) REFERENCES cursos(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- ALUMNOS (se vinculan 1 a 1 con usuarios)
----------------------------------------------------------------------

CREATE TABLE alumnos (
  id INT PRIMARY KEY,  -- = usuarios.id
  curso_id INT NOT NULL,
  cursado_id INT NOT NULL,
  fecha_inscripcion DATE,

  FOREIGN KEY (id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  FOREIGN KEY (curso_id) REFERENCES cursos(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  FOREIGN KEY (cursado_id) REFERENCES cursados(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- CUOTAS (mes a mes)
----------------------------------------------------------------------

CREATE TABLE cuotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,

  mes TINYINT NOT NULL,   -- 1 a 12
  anio SMALLINT NOT NULL,

  monto DECIMAL(10,2) NOT NULL,
  pagado BOOLEAN DEFAULT FALSE,
  fecha_pago DATE,
  fecha_vencimiento DATE NOT NULL,

  INDEX idx_alumno_fecha (alumno_id, fecha_vencimiento),

  FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- CONFIGURACIÓN DE NOTIFICACIONES (quién recibe según deuda)
----------------------------------------------------------------------

CREATE TABLE configuracion_notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,

  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,

  meses_deuda INT NOT NULL, -- 1, 2, 3, etc.

  enviar_email BOOLEAN DEFAULT TRUE,
  enviar_whatsapp BOOLEAN DEFAULT FALSE,
  enviar_push BOOLEAN DEFAULT FALSE,

  activo BOOLEAN DEFAULT TRUE
);

----------------------------------------------------------------------
-- PLANTILLAS DE MENSAJE (creadas por admins o moderadores)
----------------------------------------------------------------------

CREATE TABLE plantillas_mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,

  titulo VARCHAR(200),
  cuerpo TEXT NOT NULL, 
  -- soporta tokens como:
  -- {{nombre}}, {{apellido}}, {{dni}}, {{meses_deuda}}, {{importe_total}}, {{vencimiento_min}}

  tipo ENUM('email', 'whatsapp', 'push') NOT NULL,

  creador_id INT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (creador_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- PUSH TOKENS (APP móvil)
----------------------------------------------------------------------

CREATE TABLE tokens_push (
  id INT AUTO_INCREMENT PRIMARY KEY,

  alumno_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  dispositivo VARCHAR(120),

  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,

  INDEX(alumno_id),

  FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- HISTORIAL DE NOTIFICACIONES ENVIADAS
----------------------------------------------------------------------

CREATE TABLE notificaciones_enviadas (
  id INT AUTO_INCREMENT PRIMARY KEY,

  alumno_id INT NOT NULL,
  plantilla_id INT,
  medio ENUM('email', 'whatsapp', 'push') NOT NULL,

  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  exito BOOLEAN DEFAULT TRUE,
  detalle_error TEXT,
  referencia_externa VARCHAR(255), -- ej: ID de Gmail, WhatsApp, FCM

  INDEX idx_alumno_fecha (alumno_id, fecha_envio),

  FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  FOREIGN KEY (plantilla_id) REFERENCES plantillas_mensajes(id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

----------------------------------------------------------------------
-- VISTA ÚTIL: ALUMNOS CON DEUDA
----------------------------------------------------------------------

CREATE VIEW vista_deudas AS
SELECT 
  u.id AS usuario_id,
  u.nombre, u.apellido, u.dni, u.email, u.telefono,

  c.nombre AS curso_nombre,

  COUNT(*) AS meses_deuda,
  MIN(cu.fecha_vencimiento) AS primer_vencimiento

FROM usuarios u
JOIN alumnos a ON a.id = u.id
JOIN cuotas cu ON cu.alumno_id = a.id
JOIN cursos c ON c.id = a.curso_id

WHERE cu.pagado = FALSE

GROUP BY u.id
HAVING meses_deuda >= 1;
