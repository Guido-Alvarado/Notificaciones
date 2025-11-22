
# 🔔 Sistema de Notificaciones - Instituto Superior del Milagro

Sistema completo de gestión y envío automático de notificaciones para alumnos del ISDM.

## 📖 Descripción

Este sistema automatiza el proceso de notificaciones a alumnos sobre el estado de sus cuotas, eliminando la necesidad de envíos manuales por parte del personal administrativo.

### ✨ Características Principales

- ✅ **Gestión de Usuarios**: Roles (admin, moderador, alumno)
- ✅ **Plantillas Personalizables**: Con tokens dinámicos para personalización
- ✅ **Múltiples Canales**: Email, WhatsApp, Push Notifications
- ✅ **Envíos Individuales y Masivos**
- ✅ **Historial Completo**: Tracking de todas las notificaciones
- ✅ **Gestión de Cuotas**: Control de pagos y vencimientos
- ✅ **Notificaciones Automáticas**: Programadas diariamente
- ✅ **Dashboard Intuitivo**: Interfaz amigable para administradores
- ✅ **API REST Completa**: Documentada y lista para usar

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         Frontend (React + Electron)     │
│  - Login, Dashboard, Gestión           │
│  - Tailwind CSS, React Router          │
└─────────────┬───────────────────────────┘
              │ HTTP/REST API
┌─────────────▼───────────────────────────┐
│        Backend (Node.js + Express)      │
│  - API REST                             │
│  - JWT Authentication                   │
│  - Cron Jobs                            │
│  - Nodemailer (Email)                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Base de Datos (MySQL)          │
│  - Usuarios, Roles                      │
│  - Cursos, Alumnos, Cuotas             │
│  - Plantillas, Notificaciones          │
└─────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
Notificaciones-rama-nueva/
├── Backend/
│   ├── config/
│   │   └── db.js                 # Configuración MySQL
│   ├── controllers/
│   │   ├── auth_controller.js    # Login
│   │   ├── user_controller.js    # Usuarios
│   │   ├── plantilla_controller.js  # Plantillas
│   │   ├── curso_controller.js   # Cursos/Alumnos
│   │   ├── cuota_controller.js   # Cuotas
│   │   └── notificacion_controller.js  # Notificaciones
│   ├── middleware/
│   │   └── auth_middleware.js    # JWT + Roles
│   ├── routes/
│   │   ├── auth_routes.js
│   │   ├── user_routes.js
│   │   ├── plantilla_routes.js
│   │   ├── curso_routes.js
│   │   ├── cuota_routes.js
│   │   └── notificacion_routes.js
│   ├── server.js                 # Servidor principal
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── app-react/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── CrearUsuario.jsx
│   │   │   ├── CrearPlantilla.jsx
│   │   │   ├── EnviarNotificacion.jsx
│   │   │   ├── HistorialNotificaciones.jsx
│   │   │   └── GestionCuotas.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── electron/
│   │   └── main.cjs              # Electron main process
│   ├── package.json
│   └── vite.config.js
├── notificaciones_schema.sql    # Esquema de BD
├── setup_data.sql                # Datos de ejemplo
├── INSTALL.md                    # Guía de instalación
└── README.md                     # Este archivo
```

## 🚀 Instalación Rápida

Ver la guía completa en [INSTALL.md](INSTALL.md)

```bash
# 1. Configurar base de datos
mysql -u root -p notificaciones_isdm < notificaciones_schema.sql
mysql -u root -p notificaciones_isdm < setup_data.sql

# 2. Backend
cd Backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev

# 3. Frontend (nueva terminal)
cd app-react
npm install
npm run dev
```

## 📚 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `POST /usuarios/crear` - Crear usuario (admin/mod)

### Plantillas
- `GET /plantillas` - Listar plantillas
- `POST /plantillas` - Crear plantilla
- `PUT /plantillas/:id` - Actualizar
- `DELETE /plantillas/:id` - Eliminar

### Notificaciones
- `POST /notificaciones/enviar` - Enviar individual
- `POST /notificaciones/enviar-masivas` - Enviar masivas
- `GET /notificaciones/historial` - Ver historial

### Cuotas
- `GET /cuotas` - Listar todas
- `GET /cuotas/deudas` - Alumnos con deuda
- `POST /cuotas` - Crear cuota
- `PUT /cuotas/:id/pagar` - Registrar pago

### Académico
- `GET /academico/cursos` - Listar cursos
- `GET /academico/alumnos` - Listar alumnos
- `POST /academico/alumnos/inscribir` - Inscribir alumno

## 🎯 Funcionalidades Principales

### 1. Gestión de Plantillas
Crea plantillas reutilizables con tokens dinámicos:
- `{{nombre}}`, `{{apellido}}`, `{{dni}}`
- `{{meses_deuda}}`, `{{importe_total}}`
- `{{vencimiento_min}}`

### 2. Envío de Notificaciones
- **Individual**: A un alumno específico
- **Masivo**: A todos los alumnos o por criterio (deuda)
- **Canales**: Email, WhatsApp, Push

### 3. Automatización
- Cron job diario (9:00 AM)
- Detecta alumnos con deuda
- Envía notificaciones automáticamente según configuración

### 4. Gestión de Cuotas
- Registro de pagos
- Vista de alumnos con deuda
- Historial de pagos

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin (1)** | Acceso completo al sistema |
| **Moderador (2)** | Gestión de alumnos, cuotas y notificaciones |
| **Alumno (3)** | Ver sus propias cuotas y notificaciones |

## 🧪 Datos de Prueba

El archivo `setup_data.sql` incluye:
- 6 usuarios (1 admin, 1 mod, 4 alumnos)
- 3 cursos con 4 cursados
- 40 cuotas de ejemplo
- 3 plantillas pre-configuradas
- Historial de notificaciones de ejemplo

## 📊 Tecnologías Utilizadas

### Backend
- Node.js + Express
- MySQL2
- JWT (jsonwebtoken)
- Bcrypt
- Nodemailer
- Node-cron
- CORS

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Electron

## 🔧 Configuración Avanzada

### Email Real (Gmail)
1. Habilita "Verificación en 2 pasos" en tu cuenta de Google
2. Genera una "Contraseña de aplicación"
3. Configura en `.env`:
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### Cambiar Horario de Cron
Edita `server.js` línea 38:
```javascript
// Formato: '0 9 * * *' = 9:00 AM todos los días
cron.schedule('0 9 * * *', async () => { ... });
```

## 📝 Tokens de Plantillas

Ejemplo de plantilla:
```
Hola {{nombre}} {{apellido}},

Tenés {{meses_deuda}} cuota(s) vencida(s) por un total de ${{importe_total}}.

Primer vencimiento: {{vencimiento_min}}

Saludos,
ISDM
```

## 🐛 Solución de Problemas

Ver [INSTALL.md](INSTALL.md) sección "Solución de Problemas"

## 📄 Licencia

Este proyecto fue desarrollado para el Instituto Superior del Milagro (ISDM) como parte de Práctica Profesional II.

## 👥 Equipo de Desarrollo

- Alvarado Guido
- Toro Gastón
- Octavio Gudiño
- Gaspar Brahim Cejas
- María José Ramos Lucero
- Matías Bayón

**Profesora**: Pilar Cayo

---

✅ **Sistema de Notificaciones ISDM v1.0.0** - Noviembre 2025
