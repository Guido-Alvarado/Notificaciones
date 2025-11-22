
# Sistema de Notificaciones - ISDM

Sistema de gestión y envío automático de notificaciones para el Instituto Superior del Milagro.

## 🚀 Instalación

### Backend

```bash
cd Backend
npm install
```

### Configuración

1. Copiar el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

2. Editar `.env` con tus credenciales de base de datos y email.

3. Importar el esquema de base de datos:
```bash
mysql -u root -p < ../notificaciones_schema.sql
```

### Ejecutar el servidor

```bash
npm run dev
```

El servidor correrá en `http://localhost:4000`

## 📚 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `POST /usuarios/crear` - Crear usuario (admin/moderador)

### Plantillas
- `GET /plantillas` - Obtener todas las plantillas
- `GET /plantillas/:id` - Obtener plantilla por ID
- `POST /plantillas` - Crear plantilla
- `PUT /plantillas/:id` - Actualizar plantilla
- `DELETE /plantillas/:id` - Eliminar plantilla

### Académico
- `GET /academico/cursos` - Obtener cursos
- `POST /academico/cursos` - Crear curso
- `GET /academico/cursados` - Obtener cursados
- `POST /academico/cursados` - Crear cursado
- `GET /academico/alumnos` - Obtener alumnos
- `POST /academico/alumnos/inscribir` - Inscribir alumno

### Cuotas
- `GET /cuotas` - Obtener todas las cuotas
- `GET /cuotas/alumno/:alumno_id` - Obtener cuotas de un alumno
- `GET /cuotas/deudas` - Obtener alumnos con deuda
- `POST /cuotas` - Crear cuota
- `POST /cuotas/generar` - Generar múltiples cuotas
- `PUT /cuotas/:id/pagar` - Registrar pago

### Notificaciones
- `POST /notificaciones/enviar` - Enviar notificación individual
- `POST /notificaciones/enviar-masivas` - Enviar notificaciones masivas
- `GET /notificaciones/historial` - Ver historial de notificaciones
- `POST /notificaciones/verificar-automaticas` - Verificar y enviar automáticas

## 🔔 Notificaciones Automáticas

El sistema tiene programada una tarea automática que se ejecuta todos los días a las 9:00 AM para verificar y enviar notificaciones según las configuraciones establecidas.

## 🎨 Frontend

```bash
cd app-react
npm install
npm run dev
```

La aplicación correrá en `http://localhost:5173`

## 📖 Características

- ✅ Autenticación con JWT
- ✅ Gestión de usuarios (admin, moderador, alumno)
- ✅ Gestión de plantillas de mensajes
- ✅ Gestión de cursos, cursados y alumnos
- ✅ Gestión de cuotas y pagos
- ✅ Envío de notificaciones (email, WhatsApp, push)
- ✅ Historial de notificaciones enviadas
- ✅ Notificaciones automáticas programadas
- ✅ Soporte para tokens personalizables en plantillas

## 🔒 Roles

- **Admin (1)**: Acceso completo
- **Moderador (2)**: Gestión de alumnos y notificaciones
- **Alumno (3)**: Ver sus notificaciones y preferencias

## 📝 Tokens en Plantillas

Las plantillas soportan los siguientes tokens:
- `{{nombre}}` - Nombre del alumno
- `{{apellido}}` - Apellido del alumno
- `{{dni}}` - DNI del alumno
- `{{meses_deuda}}` - Cantidad de meses con deuda
- `{{importe_total}}` - Importe total adeudado
- `{{vencimiento_min}}` - Fecha del primer vencimiento
