
# Guía de Instalación - Sistema de Notificaciones ISDM

## 📋 Requisitos Previos

- **Node.js** v16 o superior
- **MySQL** 5.7 o superior
- **npm** o **yarn**

## 🚀 Instalación Paso a Paso

### 1. Configurar la Base de Datos

```bash
# Iniciar sesión en MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE notificaciones_isdm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Importar el esquema
mysql -u root -p notificaciones_isdm < notificaciones_schema.sql

# Cargar datos de ejemplo (opcional pero recomendado)
mysql -u root -p notificaciones_isdm < setup_data.sql
```

### 2. Configurar el Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Configuración mínima del `.env`:**
```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password_mysql
DB_NAME=notificaciones_isdm
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion_123456789
```

**Para habilitar envío real de emails (opcional):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

> ⚠️ **Nota**: Para Gmail, necesitas generar una "Contraseña de aplicación" en tu cuenta de Google. Más info: https://support.google.com/accounts/answer/185833

### 3. Iniciar el Backend

```bash
# Desde la carpeta Backend
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

### 4. Configurar el Frontend

```bash
# Abrir nueva terminal
cd app-react

# Instalar dependencias
npm install
```

### 5. Iniciar el Frontend

```bash
# Desde la carpeta app-react
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 👤 Usuarios de Prueba

Si cargaste los datos de ejemplo (`setup_data.sql`), puedes usar:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `123456` | Administrador |
| `moderador` | `123456` | Moderador |
| `jperez` | `123456` | Alumno (con 2 cuotas vencidas) |
| `mgonzalez` | `123456` | Alumno (con 3 cuotas vencidas) |
| `prodriguez` | `123456` | Alumno (al día) |
| `amartinez` | `123456` | Alumno (con 1 cuota vencida) |

## ✅ Verificar Instalación

1. Accede a `http://localhost:5173`
2. Inicia sesión con el usuario `admin` / contraseña `123456`
3. Deberías ver el dashboard con las opciones disponibles

## 🔧 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo: `sudo service mysql status`
- Verifica las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe: `SHOW DATABASES;`

### Error "bcrypt not found"
```bash
cd Backend
npm uninstall bcrypt
npm install bcrypt --save
```

### Puerto ya en uso
Si el puerto 4000 o 5173 está ocupado, cámbialos:
- Backend: modifica `PORT` en `.env`
- Frontend: modifica `vite.config.js`

### Error de CORS
Asegúrate de que el backend tenga configurado CORS correctamente (ya está incluido en `server.js`)

## 📱 Ejecutar como Aplicación de Escritorio (Electron)

```bash
cd app-react
npm run dev
```

Esto iniciará tanto Vite como Electron simultáneamente.

## 🎯 Próximos Pasos

1. Explora el sistema con el usuario admin
2. Crea plantillas de notificación personalizadas
3. Envía notificaciones de prueba
4. Revisa el historial de notificaciones
5. Gestiona cuotas de alumnos

## 📧 Soporte

Para problemas o consultas, contacta al equipo de desarrollo o revisa el archivo `README.md` del backend.
